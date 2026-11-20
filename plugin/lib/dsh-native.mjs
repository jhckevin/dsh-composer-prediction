// Source: deepseek-ai/deepseek-harness e8f7b93a344964de3dca1ace9e72b6e4d6de87cb (MIT).
// Self-contained provider serialization and public model-input projections; no application bootstrap.
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from2, except, desc) => {
  if (from2 && typeof from2 === "object" || typeof from2 === "function") {
    for (let key of __getOwnPropNames(from2))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) flags & 1 ? fns[i].call(self) : value = fns[i].call(self, value);
  return value;
};
var __decorateElement = (array, flags, name, decorators, target, extra2) => {
  var fn, it, done, ctx, access, k = flags & 7, s = !!(flags & 8), p = !!(flags & 16);
  var j = k > 3 ? array.length + 1 : k ? s ? 1 : 2 : 0, key = __decoratorStrings[k + 5];
  var initializers = k > 3 && (array[j - 1] = []), extraInitializers = array[j] || (array[j] = []);
  var desc = k && (!p && !s && (target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(k < 4 ? target : { get [name]() {
    return __privateGet(this, extra2);
  }, set [name](x) {
    return __privateSet(this, extra2, x);
  } }, name));
  k ? p && k < 4 && __name(extra2, (k > 2 ? "set " : k > 1 ? "get " : "") + name) : __name(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name, done = {}, array[3], extraInitializers);
    if (k) {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: p ? (x) => __privateIn(target, x) : (x) => name in x };
      if (k ^ 3) access.get = p ? (x) => (k ^ 1 ? __privateGet : __privateMethod)(x, target, k ^ 4 ? extra2 : desc.get) : (x) => x[name];
      if (k > 2) access.set = p ? (x, y) => __privateSet(x, target, y, k ^ 4 ? extra2 : desc.set) : (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(k ? k < 4 ? p ? extra2 : desc[key] : k > 4 ? void 0 : { get: desc.get, set: desc.set } : target, ctx), done._ = 1;
    if (k ^ 4 || it === void 0) __expectFn(it) && (k > 4 ? initializers.unshift(it) : k ? p ? extra2 = it : desc[key] = it : target = it);
    else if (typeof it !== "object" || it === null) __typeError("Object expected");
    else __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
  }
  return k || __decoratorMetadata(array, target), desc && __defProp(target, name, desc), p ? k ^ 4 ? extra2 : desc : target;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member.has(obj);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var __using = (stack, value, async) => {
  if (value != null) {
    if (typeof value !== "object" && typeof value !== "function") __typeError("Object expected");
    var dispose, inner;
    if (async) dispose = value[__knownSymbol("asyncDispose")];
    if (dispose === void 0) {
      dispose = value[__knownSymbol("dispose")];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") __typeError("Object not disposable");
    if (inner) dispose = function() {
      try {
        inner.call(this);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    stack.push([async, dispose, value]);
  } else if (async) {
    stack.push([async]);
  }
  return value;
};
var __callDispose = (stack, error, hasError) => {
  var E = typeof SuppressedError === "function" ? SuppressedError : function(e, s, m, _) {
    return _ = Error(m), _.name = "SuppressedError", _.error = e, _.suppressed = s, _;
  };
  var fail = (e) => error = hasError ? new E(e, error, "An error was suppressed during disposal") : (hasError = true, e);
  var next = (it) => {
    while (it = stack.pop()) {
      try {
        var result = it[1] && it[1].call(it[2]);
        if (it[0]) return Promise.resolve(result).then(next, (e) => (fail(e), next()));
      } catch (e) {
        fail(e);
      }
    }
    if (hasError) throw error;
  };
  return next();
};

// node_modules/semver/internal/constants.js
var require_constants = __commonJS({
  "node_modules/semver/internal/constants.js"(exports, module) {
    "use strict";
    var SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
    9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
    var WHITESPACE_CHARACTERS = [
      "	",
      "\n",
      "\v",
      "\f",
      "\r",
      " ",
      "\xA0",
      "\u1680",
      "\u2000",
      "\u2001",
      "\u2002",
      "\u2003",
      "\u2004",
      "\u2005",
      "\u2006",
      "\u2007",
      "\u2008",
      "\u2009",
      "\u200A",
      "\u2028",
      "\u2029",
      "\u202F",
      "\u205F",
      "\u3000",
      "\uFEFF"
    ];
    var RELEASE_TYPES = [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ];
    module.exports = {
      MAX_LENGTH,
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_SAFE_INTEGER,
      WHITESPACE_CHARACTERS,
      RELEASE_TYPES,
      SEMVER_SPEC_VERSION,
      FLAG_INCLUDE_PRERELEASE: 1,
      FLAG_LOOSE: 2
    };
  }
});

// node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  "node_modules/semver/internal/debug.js"(exports, module) {
    "use strict";
    var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
    };
    module.exports = debug;
  }
});

// node_modules/semver/internal/re.js
var require_re = __commonJS({
  "node_modules/semver/internal/re.js"(exports, module) {
    "use strict";
    var {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = require_constants();
    var debug = require_debug();
    exports = module.exports = {};
    var re = exports.re = [];
    var safeRe = exports.safeRe = [];
    var src = exports.src = [];
    var safeSrc = exports.safeSrc = [];
    var t = exports.t = {};
    var R = 0;
    var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    var safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    var makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    var createToken = (name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug(name, index, value);
      t[name] = index;
      src[index] = value;
      safeSrc[index] = safe;
      re[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
    createToken("FULL", `^${src[t.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
    createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
    createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
    createToken("COERCERTL", src[t.COERCE], true);
    createToken("COERCERTLFULL", src[t.COERCEFULL], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
    exports.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
    exports.caretTrimReplace = "$1^";
    createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
    exports.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }
});

// node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  "node_modules/semver/internal/parse-options.js"(exports, module) {
    "use strict";
    var looseOption = Object.freeze({ loose: true });
    var emptyOpts = Object.freeze({});
    var parseOptions = (options) => {
      if (!options) {
        return emptyOpts;
      }
      if (typeof options !== "object") {
        return looseOption;
      }
      return options;
    };
    module.exports = parseOptions;
  }
});

// node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  "node_modules/semver/internal/identifiers.js"(exports, module) {
    "use strict";
    var numeric = /^[0-9]+$/;
    var compareIdentifiers = (a, b) => {
      if (typeof a === "number" && typeof b === "number") {
        return a === b ? 0 : a < b ? -1 : 1;
      }
      const anum = numeric.test(a);
      const bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    };
    var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
    module.exports = {
      compareIdentifiers,
      rcompareIdentifiers
    };
  }
});

// node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  "node_modules/semver/classes/semver.js"(exports, module) {
    "use strict";
    var debug = require_debug();
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
    var { safeRe: re, t } = require_re();
    var parseOptions = require_parse_options();
    var { compareIdentifiers } = require_identifiers();
    var isPrereleaseIdentifier = (prerelease, identifier) => {
      const identifiers = identifier.split(".");
      if (identifiers.length > prerelease.length) {
        return false;
      }
      for (let i = 0; i < identifiers.length; i++) {
        if (compareIdentifiers(prerelease[i], identifiers[i]) !== 0) {
          return false;
        }
      }
      return true;
    };
    var SemVer = class _SemVer {
      constructor(version2, options) {
        options = parseOptions(options);
        if (version2 instanceof _SemVer) {
          if (version2.loose === !!options.loose && version2.includePrerelease === !!options.includePrerelease) {
            return version2;
          } else {
            version2 = version2.version;
          }
        } else if (typeof version2 !== "string") {
          throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version2}".`);
        }
        if (version2.length > MAX_LENGTH) {
          throw new TypeError(
            `version is longer than ${MAX_LENGTH} characters`
          );
        }
        debug("SemVer", version2, options);
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        const m = version2.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
          throw new TypeError(`Invalid Version: ${version2}`);
        }
        this.raw = version2;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError("Invalid major version");
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError("Invalid minor version");
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
          this.prerelease = [];
        } else {
          this.prerelease = m[4].split(".").map((id) => {
            if (/^[0-9]+$/.test(id)) {
              const num = +id;
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num;
              }
            }
            return id;
          });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join(".")}`;
        }
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(other) {
        debug("SemVer.compare", this.version, this.options, other);
        if (!(other instanceof _SemVer)) {
          if (typeof other === "string" && other === this.version) {
            return 0;
          }
          other = new _SemVer(other, this.options);
        }
        if (other.version === this.version) {
          return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
      }
      compareMain(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.major < other.major) {
          return -1;
        }
        if (this.major > other.major) {
          return 1;
        }
        if (this.minor < other.minor) {
          return -1;
        }
        if (this.minor > other.minor) {
          return 1;
        }
        if (this.patch < other.patch) {
          return -1;
        }
        if (this.patch > other.patch) {
          return 1;
        }
        return 0;
      }
      comparePre(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0;
        }
        let i = 0;
        do {
          const a = this.prerelease[i];
          const b = other.prerelease[i];
          debug("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      compareBuild(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        let i = 0;
        do {
          const a = this.build[i];
          const b = other.build[i];
          debug("build compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      // preminor will bump the version up to the next minor release, and immediately
      // down to pre-release. premajor and prepatch work the same way.
      inc(release, identifier, identifierBase) {
        if (release.startsWith("pre")) {
          if (!identifier && identifierBase === false) {
            throw new Error("invalid increment argument: identifier is empty");
          }
          if (identifier) {
            const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
            if (!match || match[1] !== identifier) {
              throw new Error(`invalid identifier: ${identifier}`);
            }
          }
        }
        switch (release) {
          case "premajor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor = 0;
            this.major++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "preminor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "prepatch":
            this.prerelease.length = 0;
            this.inc("patch", identifier, identifierBase);
            this.inc("pre", identifier, identifierBase);
            break;
          // If the input is a non-prerelease version, this acts the same as
          // prepatch.
          case "prerelease":
            if (this.prerelease.length === 0) {
              this.inc("patch", identifier, identifierBase);
            }
            this.inc("pre", identifier, identifierBase);
            break;
          case "release":
            if (this.prerelease.length === 0) {
              throw new Error(`version ${this.raw} is not a prerelease`);
            }
            this.prerelease.length = 0;
            break;
          case "major":
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
              this.major++;
            }
            this.minor = 0;
            this.patch = 0;
            this.prerelease = [];
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++;
            }
            this.patch = 0;
            this.prerelease = [];
            break;
          case "patch":
            if (this.prerelease.length === 0) {
              this.patch++;
            }
            this.prerelease = [];
            break;
          // This probably shouldn't be used publicly.
          // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
          case "pre": {
            const base = Number(identifierBase) ? 1 : 0;
            if (this.prerelease.length === 0) {
              this.prerelease = [base];
            } else {
              let i = this.prerelease.length;
              while (--i >= 0) {
                if (typeof this.prerelease[i] === "number") {
                  this.prerelease[i]++;
                  i = -2;
                }
              }
              if (i === -1) {
                if (identifier === this.prerelease.join(".") && identifierBase === false) {
                  throw new Error("invalid increment argument: identifier already exists");
                }
                this.prerelease.push(base);
              }
            }
            if (identifier) {
              let prerelease = [identifier, base];
              if (identifierBase === false) {
                prerelease = [identifier];
              }
              if (isPrereleaseIdentifier(this.prerelease, identifier)) {
                const prereleaseBase = this.prerelease[identifier.split(".").length];
                if (isNaN(prereleaseBase)) {
                  this.prerelease = prerelease;
                }
              } else {
                this.prerelease = prerelease;
              }
            }
            break;
          }
          default:
            throw new Error(`invalid increment argument: ${release}`);
        }
        this.raw = this.format();
        if (this.build.length) {
          this.raw += `+${this.build.join(".")}`;
        }
        return this;
      }
    };
    module.exports = SemVer;
  }
});

// node_modules/semver/functions/parse.js
var require_parse = __commonJS({
  "node_modules/semver/functions/parse.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var parse = (version2, options, throwErrors = false) => {
      if (version2 instanceof SemVer) {
        return version2;
      }
      try {
        return new SemVer(version2, options);
      } catch (er) {
        if (!throwErrors) {
          return null;
        }
        throw er;
      }
    };
    module.exports = parse;
  }
});

// node_modules/semver/functions/valid.js
var require_valid = __commonJS({
  "node_modules/semver/functions/valid.js"(exports, module) {
    "use strict";
    var parse = require_parse();
    var valid = (version2, options) => {
      const v = parse(version2, options);
      return v ? v.version : null;
    };
    module.exports = valid;
  }
});

// node_modules/semver/functions/clean.js
var require_clean = __commonJS({
  "node_modules/semver/functions/clean.js"(exports, module) {
    "use strict";
    var parse = require_parse();
    var clean = (version2, options) => {
      const s = parse(version2.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    };
    module.exports = clean;
  }
});

// node_modules/semver/functions/inc.js
var require_inc = __commonJS({
  "node_modules/semver/functions/inc.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var inc = (version2, release, options, identifier, identifierBase) => {
      if (typeof options === "string") {
        identifierBase = identifier;
        identifier = options;
        options = void 0;
      }
      try {
        return new SemVer(
          version2 instanceof SemVer ? version2.version : version2,
          options
        ).inc(release, identifier, identifierBase).version;
      } catch (er) {
        return null;
      }
    };
    module.exports = inc;
  }
});

// node_modules/semver/functions/diff.js
var require_diff = __commonJS({
  "node_modules/semver/functions/diff.js"(exports, module) {
    "use strict";
    var parse = require_parse();
    var diff = (version1, version2) => {
      const v1 = parse(version1, null, true);
      const v2 = parse(version2, null, true);
      const comparison = v1.compare(v2);
      if (comparison === 0) {
        return null;
      }
      const v1Higher = comparison > 0;
      const highVersion = v1Higher ? v1 : v2;
      const lowVersion = v1Higher ? v2 : v1;
      const highHasPre = !!highVersion.prerelease.length;
      const lowHasPre = !!lowVersion.prerelease.length;
      if (lowHasPre && !highHasPre) {
        if (!lowVersion.patch && !lowVersion.minor) {
          return "major";
        }
        if (lowVersion.compareMain(highVersion) === 0) {
          if (lowVersion.minor && !lowVersion.patch) {
            return "minor";
          }
          return "patch";
        }
      }
      const prefix = highHasPre ? "pre" : "";
      if (v1.major !== v2.major) {
        return prefix + "major";
      }
      if (v1.minor !== v2.minor) {
        return prefix + "minor";
      }
      if (v1.patch !== v2.patch) {
        return prefix + "patch";
      }
      return "prerelease";
    };
    module.exports = diff;
  }
});

// node_modules/semver/functions/major.js
var require_major = __commonJS({
  "node_modules/semver/functions/major.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var major = (a, loose) => new SemVer(a, loose).major;
    module.exports = major;
  }
});

// node_modules/semver/functions/minor.js
var require_minor = __commonJS({
  "node_modules/semver/functions/minor.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var minor = (a, loose) => new SemVer(a, loose).minor;
    module.exports = minor;
  }
});

// node_modules/semver/functions/patch.js
var require_patch = __commonJS({
  "node_modules/semver/functions/patch.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var patch = (a, loose) => new SemVer(a, loose).patch;
    module.exports = patch;
  }
});

// node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS({
  "node_modules/semver/functions/prerelease.js"(exports, module) {
    "use strict";
    var parse = require_parse();
    var prerelease = (version2, options) => {
      const parsed = parse(version2, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    };
    module.exports = prerelease;
  }
});

// node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  "node_modules/semver/functions/compare.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
    module.exports = compare;
  }
});

// node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS({
  "node_modules/semver/functions/rcompare.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var rcompare = (a, b, loose) => compare(b, a, loose);
    module.exports = rcompare;
  }
});

// node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS({
  "node_modules/semver/functions/compare-loose.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var compareLoose = (a, b) => compare(a, b, true);
    module.exports = compareLoose;
  }
});

// node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS({
  "node_modules/semver/functions/compare-build.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var compareBuild = (a, b, loose) => {
      const versionA = new SemVer(a, loose);
      const versionB = new SemVer(b, loose);
      return versionA.compare(versionB) || versionA.compareBuild(versionB);
    };
    module.exports = compareBuild;
  }
});

// node_modules/semver/functions/sort.js
var require_sort = __commonJS({
  "node_modules/semver/functions/sort.js"(exports, module) {
    "use strict";
    var compareBuild = require_compare_build();
    var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
    module.exports = sort;
  }
});

// node_modules/semver/functions/rsort.js
var require_rsort = __commonJS({
  "node_modules/semver/functions/rsort.js"(exports, module) {
    "use strict";
    var compareBuild = require_compare_build();
    var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
    module.exports = rsort;
  }
});

// node_modules/semver/functions/gt.js
var require_gt = __commonJS({
  "node_modules/semver/functions/gt.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var gt = (a, b, loose) => compare(a, b, loose) > 0;
    module.exports = gt;
  }
});

// node_modules/semver/functions/lt.js
var require_lt = __commonJS({
  "node_modules/semver/functions/lt.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var lt = (a, b, loose) => compare(a, b, loose) < 0;
    module.exports = lt;
  }
});

// node_modules/semver/functions/eq.js
var require_eq = __commonJS({
  "node_modules/semver/functions/eq.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var eq = (a, b, loose) => compare(a, b, loose) === 0;
    module.exports = eq;
  }
});

// node_modules/semver/functions/neq.js
var require_neq = __commonJS({
  "node_modules/semver/functions/neq.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var neq = (a, b, loose) => compare(a, b, loose) !== 0;
    module.exports = neq;
  }
});

// node_modules/semver/functions/gte.js
var require_gte = __commonJS({
  "node_modules/semver/functions/gte.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var gte = (a, b, loose) => compare(a, b, loose) >= 0;
    module.exports = gte;
  }
});

// node_modules/semver/functions/lte.js
var require_lte = __commonJS({
  "node_modules/semver/functions/lte.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var lte = (a, b, loose) => compare(a, b, loose) <= 0;
    module.exports = lte;
  }
});

// node_modules/semver/functions/cmp.js
var require_cmp = __commonJS({
  "node_modules/semver/functions/cmp.js"(exports, module) {
    "use strict";
    var eq = require_eq();
    var neq = require_neq();
    var gt = require_gt();
    var gte = require_gte();
    var lt = require_lt();
    var lte = require_lte();
    var cmp = (a, op, b, loose) => {
      switch (op) {
        case "===":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a === b;
        case "!==":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError(`Invalid operator: ${op}`);
      }
    };
    module.exports = cmp;
  }
});

// node_modules/semver/functions/coerce.js
var require_coerce = __commonJS({
  "node_modules/semver/functions/coerce.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var parse = require_parse();
    var { safeRe: re, t } = require_re();
    var coerce = (version2, options) => {
      if (version2 instanceof SemVer) {
        return version2;
      }
      if (typeof version2 === "number") {
        version2 = String(version2);
      }
      if (typeof version2 !== "string") {
        return null;
      }
      options = options || {};
      let match = null;
      if (!options.rtl) {
        match = version2.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
      } else {
        const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
        let next;
        while ((next = coerceRtlRegex.exec(version2)) && (!match || match.index + match[0].length !== version2.length)) {
          if (!match || next.index + next[0].length !== match.index + match[0].length) {
            match = next;
          }
          coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
        }
        coerceRtlRegex.lastIndex = -1;
      }
      if (match === null) {
        return null;
      }
      const major = match[2];
      const minor = match[3] || "0";
      const patch = match[4] || "0";
      const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
      const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
      return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
    };
    module.exports = coerce;
  }
});

// node_modules/semver/functions/truncate.js
var require_truncate = __commonJS({
  "node_modules/semver/functions/truncate.js"(exports, module) {
    "use strict";
    var parse = require_parse();
    var constants = require_constants();
    var SemVer = require_semver();
    var truncate = (version2, truncation, options) => {
      if (!constants.RELEASE_TYPES.includes(truncation)) {
        return null;
      }
      const clonedVersion = cloneInputVersion(version2, options);
      return clonedVersion && doTruncation(clonedVersion, truncation);
    };
    var cloneInputVersion = (version2, options) => {
      const versionStringToParse = version2 instanceof SemVer ? version2.version : version2;
      return parse(versionStringToParse, options);
    };
    var doTruncation = (version2, truncation) => {
      if (isPrerelease(truncation)) {
        return version2.version;
      }
      version2.prerelease = [];
      switch (truncation) {
        case "major":
          version2.minor = 0;
          version2.patch = 0;
          break;
        case "minor":
          version2.patch = 0;
          break;
      }
      return version2.format();
    };
    var isPrerelease = (type) => {
      return type.startsWith("pre");
    };
    module.exports = truncate;
  }
});

// node_modules/semver/internal/lrucache.js
var require_lrucache = __commonJS({
  "node_modules/semver/internal/lrucache.js"(exports, module) {
    "use strict";
    var LRUCache = class {
      constructor() {
        this.max = 1e3;
        this.map = /* @__PURE__ */ new Map();
      }
      get(key) {
        const value = this.map.get(key);
        if (value === void 0) {
          return void 0;
        } else {
          this.map.delete(key);
          this.map.set(key, value);
          return value;
        }
      }
      delete(key) {
        return this.map.delete(key);
      }
      set(key, value) {
        const deleted = this.delete(key);
        if (!deleted && value !== void 0) {
          if (this.map.size >= this.max) {
            const firstKey = this.map.keys().next().value;
            this.delete(firstKey);
          }
          this.map.set(key, value);
        }
        return this;
      }
    };
    module.exports = LRUCache;
  }
});

// node_modules/semver/internal/trim-comparator-whitespace.js
var require_trim_comparator_whitespace = __commonJS({
  "node_modules/semver/internal/trim-comparator-whitespace.js"(exports, module) {
    "use strict";
    var {
      MAX_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      WHITESPACE_CHARACTERS
    } = require_constants();
    var whitespace = new Uint8Array(65536);
    for (const char of WHITESPACE_CHARACTERS) {
      whitespace[char.charCodeAt(0)] = 1;
    }
    var isWhitespace2 = (char) => char !== void 0 && whitespace[char.charCodeAt(0)] === 1;
    var isVersionPrefix = (char) => char === "v" || char === "=" || isWhitespace2(char);
    var isDigit = (char) => char !== void 0 && char >= "0" && char <= "9";
    var isLetter = (char) => char !== void 0 && (char >= "a" && char <= "z" || char >= "A" && char <= "Z");
    var isIdentifierCharacter = (char) => isDigit(char) || isLetter(char) || char === "-";
    var isVersionStart = (char) => isDigit(char) || char === "x" || char === "X" || char === "*";
    var findDigitsEndIndex = (range, start, limit, digitRuns) => {
      if (!isDigit(range[start])) {
        return start;
      }
      if (start >= digitRuns.start && start < digitRuns.end) {
        return Math.min(start + limit, digitRuns.end);
      }
      if (start >= digitRuns.previousStart && start < digitRuns.previousEnd) {
        return Math.min(start + limit, digitRuns.previousEnd);
      }
      let end = start + 1;
      while (isDigit(range[end])) {
        end++;
      }
      digitRuns.previousStart = digitRuns.start;
      digitRuns.previousEnd = digitRuns.end;
      digitRuns.start = start;
      digitRuns.end = end;
      return Math.min(start + limit, end);
    };
    var findVersionNumberEndIndex = (range, start, loose, digitRuns) => {
      if (!loose && range[start] === "0") {
        return start + 1;
      }
      return findDigitsEndIndex(range, start, loose ? MAX_LENGTH : MAX_LENGTH + 1, digitRuns);
    };
    var findPrereleaseIdentifierEndIndex = (range, start, loose, digitRuns) => {
      const digitsEnd = findDigitsEndIndex(range, start, MAX_LENGTH, digitRuns);
      if (isLetter(range[digitsEnd]) || range[digitsEnd] === "-") {
        let end = digitsEnd + 1;
        const limit = end + MAX_SAFE_BUILD_LENGTH;
        while (end < limit && isIdentifierCharacter(range[end])) {
          end++;
        }
        return end;
      }
      return findVersionNumberEndIndex(range, start, loose, digitRuns);
    };
    var findPrereleaseEndIndex = (range, start, loose, digitRuns) => {
      const hyphen = range[start] === "-";
      if (!loose && !hyphen) {
        return start;
      }
      const identifierStart = start + (hyphen ? 1 : 0);
      let end = findPrereleaseIdentifierEndIndex(range, identifierStart, loose, digitRuns);
      if (end === identifierStart) {
        if (!loose || !hyphen) {
          return start;
        }
        end = findPrereleaseIdentifierEndIndex(range, start, loose, digitRuns);
      }
      while (range[end] === ".") {
        const next = findPrereleaseIdentifierEndIndex(range, end + 1, loose, digitRuns);
        if (next === end + 1) {
          break;
        }
        end = next;
      }
      return end;
    };
    var findBuildIdentifierEndIndex = (range, start) => {
      let end = start;
      while (end - start < MAX_SAFE_BUILD_LENGTH && isIdentifierCharacter(range[end])) {
        end++;
      }
      return end;
    };
    var findBuildEndIndex = (range, start) => {
      if (range[start] !== "+") {
        return start;
      }
      let end = findBuildIdentifierEndIndex(range, start + 1);
      if (end === start + 1) {
        return start;
      }
      while (range[end] === ".") {
        const next = findBuildIdentifierEndIndex(range, end + 1);
        if (next === end + 1) {
          break;
        }
        end = next;
      }
      return end;
    };
    var findLooseFullVersionEndIndex = (range, start, digitRuns) => {
      let end = start;
      for (let component = 0; component < 3; component++) {
        const next = findVersionNumberEndIndex(range, end, true, digitRuns);
        if (next === end) {
          return start;
        }
        end = next;
        if (component < 2) {
          if (range[end] !== ".") {
            return start;
          }
          end++;
        }
      }
      const prereleaseEnd = findPrereleaseEndIndex(range, end, true, digitRuns);
      return findBuildEndIndex(range, prereleaseEnd);
    };
    var findPartialVersionComponentEndIndex = (range, start, digitRuns) => {
      if (isDigit(range[start])) {
        return findVersionNumberEndIndex(range, start, false, digitRuns);
      }
      return isVersionStart(range[start]) ? start + 1 : start;
    };
    var findPartialVersionEndIndex = (range, start, digitRuns) => {
      let end = findPartialVersionComponentEndIndex(range, start, digitRuns);
      for (let component = 0; component < 2; component++) {
        if (range[end] !== ".") {
          return end;
        }
        const next = findPartialVersionComponentEndIndex(range, end + 1, digitRuns);
        if (next === end + 1) {
          return end;
        }
        end = next;
      }
      const prereleaseEnd = findPrereleaseEndIndex(range, end, false, digitRuns);
      return findBuildEndIndex(range, prereleaseEnd);
    };
    var findVersionEndIndex = (range, start, digitRuns) => {
      const fullVersionEnd = findLooseFullVersionEndIndex(range, start, digitRuns);
      return fullVersionEnd !== start ? fullVersionEnd : findPartialVersionEndIndex(range, start, digitRuns);
    };
    var findRemovableWhitespaceIndex = (range, matchStart) => {
      let position = matchStart;
      if (isWhitespace2(range[position])) {
        position++;
      }
      if (range[position] === "<" || range[position] === ">") {
        position++;
      }
      if (range[position] === "=") {
        position++;
      }
      return isWhitespace2(range[position]) ? position : -1;
    };
    var trimComparatorWhitespace = (range) => {
      let result = "";
      let copyFrom = 0;
      let cursor = 0;
      const digitRuns = { start: -1, end: -1, previousStart: -1, previousEnd: -1 };
      while (cursor < range.length) {
        const matchStart = cursor;
        if (range[cursor] === "<" || range[cursor] === ">") {
          cursor++;
        } else if (!isVersionPrefix(range[cursor]) && !isVersionStart(range[cursor])) {
          cursor++;
          continue;
        }
        while (cursor < range.length && isVersionPrefix(range[cursor])) {
          cursor++;
        }
        if (!isVersionStart(range[cursor])) {
          continue;
        }
        const whitespacePosition = findRemovableWhitespaceIndex(range, matchStart);
        if (whitespacePosition !== -1) {
          result += range.slice(copyFrom, whitespacePosition);
          copyFrom = whitespacePosition + 1;
        }
        cursor = findVersionEndIndex(range, cursor, digitRuns);
      }
      return result + range.slice(copyFrom);
    };
    module.exports = trimComparatorWhitespace;
  }
});

// node_modules/semver/classes/range.js
var require_range = __commonJS({
  "node_modules/semver/classes/range.js"(exports, module) {
    "use strict";
    var SPACE_CHARACTERS = /\s+/g;
    var Range = class _Range {
      constructor(range, options) {
        options = parseOptions(options);
        if (range instanceof _Range) {
          if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
            return range;
          } else {
            return new _Range(range.raw, options);
          }
        }
        if (range instanceof Comparator) {
          this.raw = range.value;
          this.set = [[range]];
          this.formatted = void 0;
          return this;
        }
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
        this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
        if (!this.set.length) {
          throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
        }
        if (this.set.length > 1) {
          const first = this.set[0];
          this.set = this.set.filter((c) => !isNullSet(c[0]));
          if (this.set.length === 0) {
            this.set = [first];
          } else if (this.set.length > 1) {
            for (const c of this.set) {
              if (c.length === 1 && isAny(c[0])) {
                this.set = [c];
                break;
              }
            }
          }
        }
        this.formatted = void 0;
      }
      get range() {
        if (this.formatted === void 0) {
          this.formatted = "";
          for (let i = 0; i < this.set.length; i++) {
            if (i > 0) {
              this.formatted += "||";
            }
            const comps = this.set[i];
            for (let k = 0; k < comps.length; k++) {
              if (k > 0) {
                this.formatted += " ";
              }
              this.formatted += comps[k].toString().trim();
            }
          }
        }
        return this.formatted;
      }
      format() {
        return this.range;
      }
      toString() {
        return this.range;
      }
      parseRange(range) {
        range = range.replace(BUILDSTRIPRE, "");
        const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
        const memoKey = memoOpts + ":" + range;
        const cached = cache.get(memoKey);
        if (cached) {
          return cached;
        }
        const loose = this.options.loose;
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
        range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
        debug("hyphen replace", range);
        range = trimComparatorWhitespace(range);
        debug("comparator trim", range);
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
        debug("tilde trim", range);
        range = range.replace(re[t.CARETTRIM], caretTrimReplace);
        debug("caret trim", range);
        let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
        if (loose) {
          rangeList = rangeList.filter((comp) => {
            debug("loose invalid filter", comp, this.options);
            return !!comp.match(re[t.COMPARATORLOOSE]);
          });
        }
        debug("range list", rangeList);
        const rangeMap = /* @__PURE__ */ new Map();
        const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
        for (const comp of comparators) {
          if (isNullSet(comp)) {
            return [comp];
          }
          rangeMap.set(comp.value, comp);
        }
        if (rangeMap.size > 1 && rangeMap.has("")) {
          rangeMap.delete("");
        }
        const result = [...rangeMap.values()];
        cache.set(memoKey, result);
        return result;
      }
      intersects(range, options) {
        if (!(range instanceof _Range)) {
          throw new TypeError("a Range is required");
        }
        return this.set.some((thisComparators) => {
          return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
            return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options);
              });
            });
          });
        });
      }
      // if ANY of the sets match ALL of its comparators, then pass
      test(version2) {
        if (!version2) {
          return false;
        }
        if (typeof version2 === "string") {
          try {
            version2 = new SemVer(version2, this.options);
          } catch (er) {
            return false;
          }
        }
        for (let i = 0; i < this.set.length; i++) {
          if (testSet(this.set[i], version2, this.options)) {
            return true;
          }
        }
        return false;
      }
    };
    module.exports = Range;
    var LRU = require_lrucache();
    var cache = new LRU();
    var parseOptions = require_parse_options();
    var Comparator = require_comparator();
    var debug = require_debug();
    var SemVer = require_semver();
    var trimComparatorWhitespace = require_trim_comparator_whitespace();
    var {
      safeRe: re,
      src,
      t,
      tildeTrimReplace,
      caretTrimReplace
    } = require_re();
    var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
    var BUILDSTRIPRE = new RegExp(src[t.BUILD], "g");
    var isNullSet = (c) => c.value === "<0.0.0-0";
    var isAny = (c) => c.value === "";
    var isSatisfiable = (comparators, options) => {
      let result = true;
      const remainingComparators = comparators.slice();
      let testComparator = remainingComparators.pop();
      while (result && remainingComparators.length) {
        result = remainingComparators.every((otherComparator) => {
          return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
      }
      return result;
    };
    var parseComparator = (comp, options) => {
      comp = comp.replace(re[t.BUILD], "");
      debug("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug("caret", comp);
      comp = replaceTildes(comp, options);
      debug("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug("xrange", comp);
      comp = replaceStars(comp, options);
      debug("stars", comp);
      return comp;
    };
    var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
    var invalidXRangeOrder = (M, m, p) => isX(M) && !isX(m) || isX(m) && p && !isX(p);
    var replaceTildes = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
    };
    var replaceTilde = (comp, options) => {
      const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("tilde", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
        } else if (pr) {
          debug("replaceTilde pr", pr);
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
        }
        debug("tilde return", ret);
        return ret;
      });
    };
    var replaceCarets = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
    };
    var replaceCaret = (comp, options) => {
      debug("caret", comp, options);
      const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("caret", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          if (M === "0") {
            ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
          }
        } else if (pr) {
          debug("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
          }
        } else {
          debug("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
          }
        }
        debug("caret return", ret);
        return ret;
      });
    };
    var replaceXRanges = (comp, options) => {
      debug("replaceXRanges", comp, options);
      return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
    };
    var replaceXRange = (comp, options) => {
      comp = comp.trim();
      const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
      return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
        debug("xRange", comp, ret, gtlt, M, m, p, pr);
        if (invalidXRangeOrder(M, m, p)) {
          return comp;
        }
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        pr = options.includePrerelease ? "-0" : "";
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0-0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          if (gtlt === "<") {
            pr = "-0";
          }
          ret = `${gtlt + M}.${m}.${p}${pr}`;
        } else if (xm) {
          ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
        } else if (xp) {
          ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
        }
        debug("xRange return", ret);
        return ret;
      });
    };
    var replaceStars = (comp, options) => {
      debug("replaceStars", comp, options);
      return comp.trim().replace(re[t.STAR], "");
    };
    var replaceGTE0 = (comp, options) => {
      debug("replaceGTE0", comp, options);
      return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
    };
    var hyphenReplace = (incPr) => ($0, from2, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
      if (isX(fM)) {
        from2 = "";
      } else if (isX(fm)) {
        from2 = `>=${fM}.0.0${incPr ? "-0" : ""}`;
      } else if (isX(fp)) {
        from2 = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
      } else if (fpr) {
        from2 = `>=${from2}`;
      } else {
        from2 = `>=${from2}${incPr ? "-0" : ""}`;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = `<${+tM + 1}.0.0-0`;
      } else if (isX(tp)) {
        to = `<${tM}.${+tm + 1}.0-0`;
      } else if (tpr) {
        to = `<=${tM}.${tm}.${tp}-${tpr}`;
      } else if (incPr) {
        to = `<${tM}.${tm}.${+tp + 1}-0`;
      } else {
        to = `<=${to}`;
      }
      return `${from2} ${to}`.trim();
    };
    var testSet = (set2, version2, options) => {
      for (let i = 0; i < set2.length; i++) {
        if (!set2[i].test(version2)) {
          return false;
        }
      }
      if (version2.prerelease.length && !options.includePrerelease) {
        for (let i = 0; i < set2.length; i++) {
          debug(set2[i].semver);
          if (set2[i].semver === Comparator.ANY) {
            continue;
          }
          if (set2[i].semver.prerelease.length > 0) {
            const allowed = set2[i].semver;
            if (allowed.major === version2.major && allowed.minor === version2.minor && allowed.patch === version2.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    };
  }
});

// node_modules/semver/classes/comparator.js
var require_comparator = __commonJS({
  "node_modules/semver/classes/comparator.js"(exports, module) {
    "use strict";
    var ANY = Symbol("SemVer ANY");
    var Comparator = class _Comparator {
      static get ANY() {
        return ANY;
      }
      constructor(comp, options) {
        options = parseOptions(options);
        if (comp instanceof _Comparator) {
          if (comp.loose === !!options.loose) {
            return comp;
          } else {
            comp = comp.value;
          }
        }
        comp = comp.trim().split(/\s+/).join(" ");
        debug("comparator", comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
          this.value = "";
        } else {
          this.value = this.operator + this.semver.version;
        }
        debug("comp", this);
      }
      parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
        const m = comp.match(r);
        if (!m) {
          throw new TypeError(`Invalid comparator: ${comp}`);
        }
        this.operator = m[1] !== void 0 ? m[1] : "";
        if (this.operator === "=") {
          this.operator = "";
        }
        if (!m[2]) {
          this.semver = ANY;
        } else {
          this.semver = new SemVer(m[2], this.options.loose);
        }
      }
      toString() {
        return this.value;
      }
      test(version2) {
        debug("Comparator.test", version2, this.options.loose);
        if (this.semver === ANY || version2 === ANY) {
          return true;
        }
        if (typeof version2 === "string") {
          try {
            version2 = new SemVer(version2, this.options);
          } catch (er) {
            return false;
          }
        }
        return cmp(version2, this.operator, this.semver, this.options);
      }
      intersects(comp, options) {
        if (!(comp instanceof _Comparator)) {
          throw new TypeError("a Comparator is required");
        }
        if (this.operator === "") {
          if (this.value === "") {
            return true;
          }
          return new Range(comp.value, options).test(this.value);
        } else if (comp.operator === "") {
          if (comp.value === "") {
            return true;
          }
          return new Range(this.value, options).test(comp.semver);
        }
        options = parseOptions(options);
        if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
          return false;
        }
        if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
          return false;
        }
        if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
          return true;
        }
        if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
          return true;
        }
        if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
          return true;
        }
        if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
          return true;
        }
        if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
          return true;
        }
        return false;
      }
    };
    module.exports = Comparator;
    var parseOptions = require_parse_options();
    var { safeRe: re, t } = require_re();
    var cmp = require_cmp();
    var debug = require_debug();
    var SemVer = require_semver();
    var Range = require_range();
  }
});

// node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS({
  "node_modules/semver/functions/satisfies.js"(exports, module) {
    "use strict";
    var Range = require_range();
    var satisfies = (version2, range, options) => {
      try {
        range = new Range(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version2);
    };
    module.exports = satisfies;
  }
});

// node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS({
  "node_modules/semver/ranges/to-comparators.js"(exports, module) {
    "use strict";
    var Range = require_range();
    var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
    module.exports = toComparators;
  }
});

// node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS({
  "node_modules/semver/ranges/max-satisfying.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var Range = require_range();
    var maxSatisfying = (versions, range, options) => {
      let max = null;
      let maxSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v;
            maxSV = new SemVer(max, options);
          }
        }
      });
      return max;
    };
    module.exports = maxSatisfying;
  }
});

// node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS({
  "node_modules/semver/ranges/min-satisfying.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var Range = require_range();
    var minSatisfying = (versions, range, options) => {
      let min = null;
      let minSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    };
    module.exports = minSatisfying;
  }
});

// node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS({
  "node_modules/semver/ranges/min-version.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var Range = require_range();
    var gt = require_gt();
    var minVersion = (range, loose) => {
      range = new Range(range, loose);
      let minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let setMin = null;
        comparators.forEach((comparator) => {
          const compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            /* fallthrough */
            case "":
            case ">=":
              if (!setMin || gt(compver, setMin)) {
                setMin = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            /* istanbul ignore next */
            default:
              throw new Error(`Unexpected operation: ${comparator.operator}`);
          }
        });
        if (setMin && (!minver || gt(minver, setMin))) {
          minver = setMin;
        }
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    };
    module.exports = minVersion;
  }
});

// node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS({
  "node_modules/semver/ranges/valid.js"(exports, module) {
    "use strict";
    var Range = require_range();
    var validRange = (range, options) => {
      try {
        return new Range(range, options).range || "*";
      } catch (er) {
        return null;
      }
    };
    module.exports = validRange;
  }
});

// node_modules/semver/ranges/outside.js
var require_outside = __commonJS({
  "node_modules/semver/ranges/outside.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var Range = require_range();
    var satisfies = require_satisfies();
    var gt = require_gt();
    var lt = require_lt();
    var lte = require_lte();
    var gte = require_gte();
    var outside = (version2, range, hilo, options) => {
      version2 = new SemVer(version2, options);
      range = new Range(range, options);
      let gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies(version2, range, options)) {
        return false;
      }
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let high = null;
        let low = null;
        comparators.forEach((comparator) => {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version2, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version2, low.semver)) {
          return false;
        }
      }
      return true;
    };
    module.exports = outside;
  }
});

// node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS({
  "node_modules/semver/ranges/gtr.js"(exports, module) {
    "use strict";
    var outside = require_outside();
    var gtr = (version2, range, options) => outside(version2, range, ">", options);
    module.exports = gtr;
  }
});

// node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS({
  "node_modules/semver/ranges/ltr.js"(exports, module) {
    "use strict";
    var outside = require_outside();
    var ltr = (version2, range, options) => outside(version2, range, "<", options);
    module.exports = ltr;
  }
});

// node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS({
  "node_modules/semver/ranges/intersects.js"(exports, module) {
    "use strict";
    var Range = require_range();
    var intersects = (r1, r2, options) => {
      r1 = new Range(r1, options);
      r2 = new Range(r2, options);
      return r1.intersects(r2, options);
    };
    module.exports = intersects;
  }
});

// node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS({
  "node_modules/semver/ranges/simplify.js"(exports, module) {
    "use strict";
    var satisfies = require_satisfies();
    var compare = require_compare();
    module.exports = (versions, range, options) => {
      const set2 = [];
      let first = null;
      let prev = null;
      const v = versions.sort((a, b) => compare(a, b, options));
      for (const version2 of v) {
        const included = satisfies(version2, range, options);
        if (included) {
          prev = version2;
          if (!first) {
            first = version2;
          }
        } else {
          if (prev) {
            set2.push([first, prev]);
          }
          prev = null;
          first = null;
        }
      }
      if (first) {
        set2.push([first, null]);
      }
      const ranges = [];
      for (const [min, max] of set2) {
        if (min === max) {
          ranges.push(min);
        } else if (!max && min === v[0]) {
          ranges.push("*");
        } else if (!max) {
          ranges.push(`>=${min}`);
        } else if (min === v[0]) {
          ranges.push(`<=${max}`);
        } else {
          ranges.push(`${min} - ${max}`);
        }
      }
      const simplified = ranges.join(" || ");
      const original = typeof range.raw === "string" ? range.raw : String(range);
      return simplified.length < original.length ? simplified : range;
    };
  }
});

// node_modules/semver/ranges/subset.js
var require_subset = __commonJS({
  "node_modules/semver/ranges/subset.js"(exports, module) {
    "use strict";
    var Range = require_range();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var satisfies = require_satisfies();
    var compare = require_compare();
    var subset = (sub, dom, options = {}) => {
      if (sub === dom) {
        return true;
      }
      sub = new Range(sub, options);
      dom = new Range(dom, options);
      let sawNonNull = false;
      OUTER: for (const simpleSub of sub.set) {
        for (const simpleDom of dom.set) {
          const isSub = simpleSubset(simpleSub, simpleDom, options);
          sawNonNull = sawNonNull || isSub !== null;
          if (isSub) {
            continue OUTER;
          }
        }
        if (sawNonNull) {
          return false;
        }
      }
      return true;
    };
    var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
    var minimumVersion = [new Comparator(">=0.0.0")];
    var simpleSubset = (sub, dom, options) => {
      if (sub === dom) {
        return true;
      }
      if (sub.length === 1 && sub[0].semver === ANY) {
        if (dom.length === 1 && dom[0].semver === ANY) {
          return true;
        } else if (options.includePrerelease) {
          sub = minimumVersionWithPreRelease;
        } else {
          sub = minimumVersion;
        }
      }
      if (dom.length === 1 && dom[0].semver === ANY) {
        if (options.includePrerelease) {
          return true;
        } else {
          dom = minimumVersion;
        }
      }
      const eqSet = /* @__PURE__ */ new Set();
      let gt, lt;
      for (const c of sub) {
        if (c.operator === ">" || c.operator === ">=") {
          gt = higherGT(gt, c, options);
        } else if (c.operator === "<" || c.operator === "<=") {
          lt = lowerLT(lt, c, options);
        } else {
          eqSet.add(c.semver);
        }
      }
      if (eqSet.size > 1) {
        return null;
      }
      let gtltComp;
      if (gt && lt) {
        gtltComp = compare(gt.semver, lt.semver, options);
        if (gtltComp > 0) {
          return null;
        } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
          return null;
        }
      }
      for (const eq of eqSet) {
        if (gt && !satisfies(eq, String(gt), options)) {
          return null;
        }
        if (lt && !satisfies(eq, String(lt), options)) {
          return null;
        }
        for (const c of dom) {
          if (!satisfies(eq, String(c), options)) {
            return false;
          }
        }
        return true;
      }
      let higher, lower;
      let hasDomLT, hasDomGT;
      let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
      let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
      if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
        needDomLTPre = false;
      }
      for (const c of dom) {
        hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
        hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
        if (gt) {
          if (needDomGTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
              needDomGTPre = false;
            }
          }
          if (c.operator === ">" || c.operator === ">=") {
            higher = higherGT(gt, c, options);
            if (higher === c && higher !== gt) {
              return false;
            }
          } else if (gt.operator === ">=" && !c.test(gt.semver)) {
            return false;
          }
        }
        if (lt) {
          if (needDomLTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
              needDomLTPre = false;
            }
          }
          if (c.operator === "<" || c.operator === "<=") {
            lower = lowerLT(lt, c, options);
            if (lower === c && lower !== lt) {
              return false;
            }
          } else if (lt.operator === "<=" && !c.test(lt.semver)) {
            return false;
          }
        }
        if (!c.operator && (lt || gt) && gtltComp !== 0) {
          return false;
        }
      }
      if (gt && hasDomLT && !lt && gtltComp !== 0) {
        return false;
      }
      if (lt && hasDomGT && !gt && gtltComp !== 0) {
        return false;
      }
      if (needDomGTPre || needDomLTPre) {
        return false;
      }
      return true;
    };
    var higherGT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
    };
    var lowerLT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
    };
    module.exports = subset;
  }
});

// node_modules/semver/index.js
var require_semver2 = __commonJS({
  "node_modules/semver/index.js"(exports, module) {
    "use strict";
    var internalRe = require_re();
    var constants = require_constants();
    var SemVer = require_semver();
    var identifiers = require_identifiers();
    var parse = require_parse();
    var valid = require_valid();
    var clean = require_clean();
    var inc = require_inc();
    var diff = require_diff();
    var major = require_major();
    var minor = require_minor();
    var patch = require_patch();
    var prerelease = require_prerelease();
    var compare = require_compare();
    var rcompare = require_rcompare();
    var compareLoose = require_compare_loose();
    var compareBuild = require_compare_build();
    var sort = require_sort();
    var rsort = require_rsort();
    var gt = require_gt();
    var lt = require_lt();
    var eq = require_eq();
    var neq = require_neq();
    var gte = require_gte();
    var lte = require_lte();
    var cmp = require_cmp();
    var coerce = require_coerce();
    var truncate = require_truncate();
    var Comparator = require_comparator();
    var Range = require_range();
    var satisfies = require_satisfies();
    var toComparators = require_to_comparators();
    var maxSatisfying = require_max_satisfying();
    var minSatisfying = require_min_satisfying();
    var minVersion = require_min_version();
    var validRange = require_valid2();
    var outside = require_outside();
    var gtr = require_gtr();
    var ltr = require_ltr();
    var intersects = require_intersects();
    var simplifyRange = require_simplify();
    var subset = require_subset();
    module.exports = {
      parse,
      valid,
      clean,
      inc,
      diff,
      major,
      minor,
      patch,
      prerelease,
      compare,
      rcompare,
      compareLoose,
      compareBuild,
      sort,
      rsort,
      gt,
      lt,
      eq,
      neq,
      gte,
      lte,
      cmp,
      coerce,
      truncate,
      Comparator,
      Range,
      satisfies,
      toComparators,
      maxSatisfying,
      minSatisfying,
      minVersion,
      validRange,
      outside,
      gtr,
      ltr,
      intersects,
      simplifyRange,
      subset,
      SemVer,
      re: internalRe.re,
      src: internalRe.src,
      tokens: internalRe.t,
      SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
      RELEASE_TYPES: constants.RELEASE_TYPES,
      compareIdentifiers: identifiers.compareIdentifiers,
      rcompareIdentifiers: identifiers.rcompareIdentifiers
    };
  }
});

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/vendor/cosmokit/src/misc.ts
function isNullable(value) {
  return value === null || value === void 0;
}
function isPlainObject(data) {
  return data && typeof data === "object" && !Array.isArray(data);
}
function filterKeys(object2, filter) {
  return Object.fromEntries(Object.entries(object2).filter(([key, value]) => filter(key, value)));
}
function mapValues(object2, transform) {
  return Object.fromEntries(Object.entries(object2).map(([key, value]) => [key, transform(value, key)]));
}
function pick(source, keys, forced) {
  if (!keys) return { ...source };
  const result = {};
  for (const key of keys) {
    if (forced || source[key] !== void 0) result[key] = source[key];
  }
  return result;
}
function defineProperty(object2, key, value) {
  return Object.defineProperty(object2, key, { writable: true, value, enumerable: false });
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/vendor/cosmokit/src/volatile.ts
var write = Symbol.for("cosmokit.volatile.write");
function snapshot(value, ancestors = /* @__PURE__ */ new Set()) {
  if (typeof value === "function") throw new TypeError("volatile config cannot contain functions");
  if (value === null || typeof value !== "object") return value;
  if (ancestors.has(value)) throw new TypeError("volatile config cannot contain cycles");
  ancestors.add(value);
  try {
    if (Array.isArray(value)) return Object.freeze(value.map((item) => snapshot(item, ancestors)));
    if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) {
      throw new TypeError("volatile config objects must be plain objects or arrays");
    }
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, snapshot(item, ancestors)])));
  } finally {
    ancestors.delete(value);
  }
}
function createVolatile(value) {
  let current = snapshot(value);
  return Object.freeze({
    get: () => current,
    [write]: (value2) => {
      current = value2;
    }
  });
}
function isVolatile(value) {
  return typeof value === "object" && value !== null && write in value;
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/vendor/cosmokit/src/types.ts
function is(type, value) {
  if (arguments.length === 1) return (value2) => is(type, value2);
  return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
}
function isArrayBufferLike(value) {
  return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
}
function isArrayBufferSource(value) {
  return isArrayBufferLike(value) || ArrayBuffer.isView(value);
}
var Binary;
((Binary2) => {
  Binary2.is = isArrayBufferLike;
  Binary2.isSource = isArrayBufferSource;
  function fromSource(source) {
    if (ArrayBuffer.isView(source)) {
      return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
    } else {
      return source;
    }
  }
  Binary2.fromSource = fromSource;
  function toBase64(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") {
      return Buffer.from(source).toString("base64");
    }
    let binary = "";
    const bytes = new Uint8Array(source);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  Binary2.toBase64 = toBase64;
  function fromBase64(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
    return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
  }
  Binary2.fromBase64 = fromBase64;
  function toHex(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
    return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  Binary2.toHex = toHex;
  function fromHex(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
    const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
    const buffer = [];
    for (let i = 0; i < hex.length; i += 2) {
      buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
    }
    return Uint8Array.from(buffer).buffer;
  }
  Binary2.fromHex = fromHex;
})(Binary || (Binary = {}));
var base64ToArrayBuffer = Binary.fromBase64;
var arrayBufferToBase64 = Binary.toBase64;
var hexToArrayBuffer = Binary.fromHex;
var arrayBufferToHex = Binary.toHex;
function clone(source, refs = /* @__PURE__ */ new Map()) {
  if (!source || typeof source !== "object") return source;
  if (is("Date", source)) return new Date(source.valueOf());
  if (is("RegExp", source)) return new RegExp(source.source, source.flags);
  if (isArrayBufferLike(source)) return source.slice(0);
  if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  const cached = refs.get(source);
  if (cached) return cached;
  if (Array.isArray(source)) {
    const result2 = [];
    refs.set(source, result2);
    source.forEach((value, index) => {
      result2[index] = Reflect.apply(clone, null, [value, refs]);
    });
    return result2;
  }
  const result = Object.create(Object.getPrototypeOf(source));
  refs.set(source, result);
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
    if ("value" in descriptor) {
      descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
    }
    Reflect.defineProperty(result, key, descriptor);
  }
  return result;
}
function deepEqual(a, b, strict) {
  const ancestors = /* @__PURE__ */ new Set();
  function compare(a2, b2) {
    if (a2 === b2) return true;
    if (isVolatile(a2) || isVolatile(b2)) return isVolatile(a2) && isVolatile(b2);
    if (!strict && isNullable(a2) && isNullable(b2)) return true;
    if (typeof a2 !== typeof b2 || typeof a2 !== "object" || !a2 || !b2) return false;
    if (ancestors.has(a2)) return false;
    function check(test, then) {
      return test(a2) ? test(b2) ? then(a2, b2) : false : test(b2) ? false : void 0;
    }
    ancestors.add(a2);
    try {
      return check(Array.isArray, (a3, b3) => {
        if (a3.length !== b3.length) return false;
        for (let index = 0; index < a3.length; index++) {
          if (!compare(a3[index], b3[index])) return false;
        }
        return true;
      }) ?? check(is("Date"), (a3, b3) => a3.valueOf() === b3.valueOf()) ?? check(is("URL"), (a3, b3) => a3.href === b3.href) ?? check(is("RegExp"), (a3, b3) => a3.source === b3.source && a3.flags === b3.flags) ?? check(isArrayBufferLike, (a3, b3) => {
        if (a3.byteLength !== b3.byteLength) return false;
        const viewA = new Uint8Array(a3);
        const viewB = new Uint8Array(b3);
        for (let i = 0; i < viewA.length; i++) {
          if (viewA[i] !== viewB[i]) return false;
        }
        return true;
      }) ?? ((!strict || [a2, b2].every((value) => Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)) && Object.keys({ ...a2, ...b2 }).every((key) => compare(a2[key], b2[key])));
    } finally {
      ancestors.delete(a2);
    }
  }
  return compare(a, b);
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/vendor/cosmokit/src/string.ts
function tokenize(source, delimiters, delimiter) {
  const output = [];
  let state = 0 /* DELIM */;
  for (let i = 0; i < source.length; i++) {
    const code = source.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      if (state === 1 /* UPPER */) {
        const next = source.charCodeAt(i + 1);
        if (next >= 97 && next <= 122) {
          output.push(delimiter);
        }
        output.push(code + 32);
      } else {
        if (state !== 0 /* DELIM */) {
          output.push(delimiter);
        }
        output.push(code + 32);
      }
      state = 1 /* UPPER */;
    } else if (code >= 97 && code <= 122) {
      output.push(code);
      state = 2 /* LOWER */;
    } else if (delimiters.includes(code)) {
      if (state !== 0 /* DELIM */) {
        output.push(delimiter);
      }
      state = 0 /* DELIM */;
    } else {
      output.push(code);
    }
  }
  return String.fromCharCode(...output);
}
function paramCase(source) {
  return tokenize(source, [45, 95], 45);
}
var hyphenate = paramCase;

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/vendor/cosmokit/src/time.ts
var Time;
((Time2) => {
  Time2.millisecond = 1;
  Time2.second = 1e3;
  Time2.minute = Time2.second * 60;
  Time2.hour = Time2.minute * 60;
  Time2.day = Time2.hour * 24;
  Time2.week = Time2.day * 7;
  let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
  function setTimezoneOffset(offset) {
    timezoneOffset = offset;
  }
  Time2.setTimezoneOffset = setTimezoneOffset;
  function getTimezoneOffset() {
    return timezoneOffset;
  }
  Time2.getTimezoneOffset = getTimezoneOffset;
  function getDateNumber(date2 = /* @__PURE__ */ new Date(), offset) {
    if (typeof date2 === "number") date2 = new Date(date2);
    if (offset === void 0) offset = timezoneOffset;
    return Math.floor((date2.valueOf() / Time2.minute - offset) / 1440);
  }
  Time2.getDateNumber = getDateNumber;
  function fromDateNumber(value, offset) {
    const date2 = new Date(value * Time2.day);
    if (offset === void 0) offset = timezoneOffset;
    return new Date(+date2 + offset * Time2.minute);
  }
  Time2.fromDateNumber = fromDateNumber;
  const numeric = /\d+(?:\.\d+)?/.source;
  const timeRegExp = new RegExp(`^${[
    "w(?:eek(?:s)?)?",
    "d(?:ay(?:s)?)?",
    "h(?:our(?:s)?)?",
    "m(?:in(?:ute)?(?:s)?)?",
    "s(?:ec(?:ond)?(?:s)?)?"
  ].map((unit) => `(${numeric}${unit})?`).join("")}$`);
  function parseTime(source) {
    const capture = timeRegExp.exec(source);
    if (!capture) return 0;
    return (parseFloat(capture[1]) * Time2.week || 0) + (parseFloat(capture[2]) * Time2.day || 0) + (parseFloat(capture[3]) * Time2.hour || 0) + (parseFloat(capture[4]) * Time2.minute || 0) + (parseFloat(capture[5]) * Time2.second || 0);
  }
  Time2.parseTime = parseTime;
  function parseDate(date2) {
    const parsed = parseTime(date2);
    if (parsed) {
      date2 = Date.now() + parsed;
    } else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date2)) {
      date2 = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date2}`;
    } else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date2)) {
      date2 = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date2}`;
    }
    return date2 ? new Date(date2) : /* @__PURE__ */ new Date();
  }
  Time2.parseDate = parseDate;
  function format(ms) {
    const abs = Math.abs(ms);
    if (abs >= Time2.day - Time2.hour / 2) {
      return Math.round(ms / Time2.day) + "d";
    } else if (abs >= Time2.hour - Time2.minute / 2) {
      return Math.round(ms / Time2.hour) + "h";
    } else if (abs >= Time2.minute - Time2.second / 2) {
      return Math.round(ms / Time2.minute) + "m";
    } else if (abs >= Time2.second) {
      return Math.round(ms / Time2.second) + "s";
    }
    return ms + "ms";
  }
  Time2.format = format;
  function toDigits(source, length = 2) {
    return source.toString().padStart(length, "0");
  }
  Time2.toDigits = toDigits;
  function template(template2, time = /* @__PURE__ */ new Date()) {
    return template2.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
  }
  Time2.template = template;
})(Time || (Time = {}));

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/vendor/cordis/src/utils.ts
var DisposableList = class {
  sn = 0;
  map = /* @__PURE__ */ new Map();
  weak = /* @__PURE__ */ new WeakMap();
  get length() {
    return this.map.size;
  }
  push(value) {
    const sn = ++this.sn;
    this.map.set(sn, value);
    this.weak.set(value, sn);
    return () => this.map.delete(sn);
  }
  delete(value) {
    const sn = this.weak.get(value);
    if (!sn) return false;
    return this.map.delete(sn);
  }
  clear() {
    const values = [...this.map.values()];
    this.map.clear();
    return values.reverse();
  }
  [Symbol.iterator]() {
    return this.map.values();
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return [...this];
  }
};
var symbols = {
  // internal symbols
  shadow: Symbol.for("cordis.shadow"),
  caller: Symbol.for("cordis.caller"),
  receiver: Symbol.for("cordis.receiver"),
  original: Symbol.for("cordis.original"),
  metadata: Symbol.for("cordis.metadata"),
  initHooks: Symbol.for("cordis.initHooks"),
  checkProto: Symbol.for("cordis.checkProto"),
  // context symbols
  effect: Symbol.for("cordis.effect"),
  filter: Symbol.for("cordis.filter"),
  isolate: Symbol.for("cordis.isolate"),
  intercept: Symbol.for("cordis.intercept"),
  // service symbols
  init: Symbol.for("cordis.init"),
  check: Symbol.for("cordis.check"),
  config: Symbol.for("cordis.config"),
  invoke: Symbol.for("cordis.invoke"),
  extend: Symbol.for("cordis.extend"),
  tracker: Symbol.for("cordis.tracker"),
  resolveConfig: Symbol.for("cordis.resolveConfig")
};
var GeneratorFunction = function* () {
}.constructor;
var AsyncGeneratorFunction = async function* () {
}.constructor;
function isConstructor(func) {
  if (!func.prototype) return false;
  if (func instanceof GeneratorFunction) return false;
  if (AsyncGeneratorFunction !== Function && func instanceof AsyncGeneratorFunction) return false;
  return true;
}
function joinPrototype(proto1, proto2) {
  if (proto1 === Object.prototype) return proto2;
  const result = Object.create(joinPrototype(Object.getPrototypeOf(proto1), proto2));
  for (const key of Reflect.ownKeys(proto1)) {
    Object.defineProperty(result, key, Object.getOwnPropertyDescriptor(proto1, key));
  }
  return result;
}
function isObject(value) {
  return value && (typeof value === "object" || typeof value === "function");
}
function getPropertyDescriptor(target, prop) {
  let proto = target;
  while (proto) {
    const desc = Reflect.getOwnPropertyDescriptor(proto, prop);
    if (desc) return desc;
    proto = Object.getPrototypeOf(proto);
  }
}
function getTraceable(ctx, value) {
  if (!isObject(value)) return value;
  if (Object.hasOwn(value, symbols.shadow)) {
    return Object.getPrototypeOf(value);
  }
  const tracker = value[symbols.tracker];
  if (!tracker) return value;
  return createTraceable(ctx, value, tracker);
}
function withProps(target, props) {
  if (!props) return target;
  return new Proxy(target, {
    get: (target2, prop, receiver) => {
      if (prop in props && prop !== "constructor") return Reflect.get(props, prop, receiver);
      return Reflect.get(target2, prop, receiver);
    },
    set: (target2, prop, value, receiver) => {
      if (prop in props && prop !== "constructor") return Reflect.set(props, prop, value, receiver);
      return Reflect.set(target2, prop, value, receiver);
    }
  });
}
function withProp(target, prop, value) {
  return withProps(target, Object.defineProperty(/* @__PURE__ */ Object.create(null), prop, {
    value,
    writable: false
  }));
}
function createShadow(useSite, target, property2, receiver) {
  if (!property2) return receiver;
  const value = getPropertyDescriptor(target, property2)?.value;
  if (!value) return receiver;
  const defSite = value[symbols.shadow] ?? value;
  return withProp(receiver, property2, useSite.extend({ [symbols.shadow]: defSite }));
}
function createShadowMethod(ctx, value, outer, shadow) {
  return new Proxy(value, {
    apply: (target, thisArg, args) => {
      if (thisArg === outer) thisArg = shadow;
      return getTraceable(ctx, Reflect.apply(target, thisArg, args));
    }
  });
}
function createTraceable(ctx, value, tracker) {
  const defSite = ctx[symbols.shadow] ?? ctx;
  const useSite = ctx[symbols.shadow] ? Object.getPrototypeOf(ctx) : ctx;
  const proxy = new Proxy(value, {
    get: (target, prop, receiver) => {
      if (prop === symbols.original) return target;
      if (prop === symbols.caller) return defSite;
      if (prop === tracker.property) return useSite;
      if (typeof prop === "symbol") {
        return Reflect.get(target, prop, receiver);
      }
      if (tracker.associate && useSite.reflect.props[`${tracker.associate}.${prop}`]) {
        return Reflect.get(ctx, `${tracker.associate}.${prop}`, withProp(ctx, symbols.receiver, receiver));
      }
      let shadow, innerValue;
      const desc = getPropertyDescriptor(target, prop);
      if (desc && "value" in desc) {
        innerValue = desc.value;
      } else {
        shadow = createShadow(useSite, target, tracker.property, receiver);
        innerValue = Reflect.get(target, prop, shadow);
      }
      const innerTracker = innerValue?.[symbols.tracker];
      if (innerTracker) {
        return createTraceable(useSite, innerValue, innerTracker);
      } else if (!tracker.noShadow && typeof innerValue === "function") {
        shadow ??= createShadow(useSite, target, tracker.property, receiver);
        return createShadowMethod(useSite, innerValue, receiver, shadow);
      } else {
        return innerValue;
      }
    },
    set: (target, prop, value2, receiver) => {
      if (prop === symbols.original) return false;
      if (prop === symbols.caller) return false;
      if (prop === tracker.property) return false;
      if (typeof prop === "symbol") {
        return Reflect.set(target, prop, value2, receiver);
      }
      if (tracker.associate && useSite.reflect.props[`${tracker.associate}.${prop}`]) {
        return Reflect.set(ctx, `${tracker.associate}.${prop}`, value2, withProp(ctx, symbols.receiver, receiver));
      }
      const shadow = createShadow(useSite, target, tracker.property, receiver);
      return Reflect.set(target, prop, value2, shadow);
    },
    apply: (target, thisArg, args) => {
      const receiver = tracker.noShadow ? proxy : createShadow(useSite, target, tracker.property, proxy);
      return applyTraceable(receiver, target, thisArg, args);
    }
  });
  return proxy;
}
function applyTraceable(proxy, value, thisArg, args) {
  if (!value[symbols.invoke]) return Reflect.apply(value, thisArg, args);
  return value[symbols.invoke].apply(proxy, args);
}
function createCallable(name, proto, tracker) {
  const self = function(...args) {
    const proxy = createTraceable(self["ctx"], self, tracker);
    return Reflect.apply(proxy, this, args);
  };
  defineProperty(self, "name", name);
  return Object.setPrototypeOf(self, proto);
}
function handleError(info, reason, getOuterStack) {
  const innerLines = info.error.stack.split("\n");
  if (typeof reason?.stack !== "string") {
    const outerError = new Error(reason);
    const lines2 = outerError.stack.split("\n");
    lines2.splice(1, Infinity, ...getOuterStack());
    outerError.stack = lines2.join("\n");
    throw outerError;
  }
  const lines = reason.stack.split("\n");
  let index = lines.indexOf(innerLines[2]);
  if (index === -1) throw reason;
  index -= info.offset;
  while (index > 0) {
    if (!lines[index - 1].endsWith(" (<anonymous>)")) break;
    index -= 1;
  }
  lines.splice(index, Infinity, ...getOuterStack());
  reason.stack = lines.join("\n");
  throw reason;
}
function composeError(callback, getOuterStack = buildOuterStack()) {
  const info = { offset: 1, error: new Error() };
  try {
    const result = callback(info);
    if (isObject(result) && "then" in result) {
      return result.then(void 0, (reason) => handleError(info, reason, getOuterStack));
    } else {
      return result;
    }
  } catch (reason) {
    handleError(info, reason, getOuterStack);
  }
}
function buildOuterStack(offset = 0) {
  const outerError = new Error();
  return () => outerError.stack.split("\n").slice(3 + offset);
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/vendor/cordis/src/fiber.ts
var kValidationError = Symbol.for("ValidationError");
var ValidationError = class extends TypeError {
  name = "ValidationError";
  /**
   * Build the aggregated message from schema issues.
   *
   * @param issues — the standard-schema issues, one message line each.
   */
  constructor(issues) {
    super(`invalid config:
` + issues.map((issue) => {
      if (issue.path) {
        return `  - ${issue.message} (at ${issue.path.join(".")})`;
      } else {
        return `  - ${issue.message}`;
      }
    }).join("\n"));
  }
};
Object.defineProperty(ValidationError.prototype, kValidationError, {
  value: true
});
function resolveConfig(runtime, config) {
  if (!runtime.Config) return config;
  const result = runtime.Config["~standard"].validate(config);
  if ("then" in result) {
    throw new TypeError("Async config validation is not supported");
  }
  if (result.issues) {
    throw new ValidationError(result.issues);
  } else {
    return result.value;
  }
}
var effectInertia = /* @__PURE__ */ new WeakMap();
function runDisposable(dispose) {
  const result = dispose();
  return effectInertia.get(dispose)?.() ?? result;
}
function emitPluginDisposed(context, fiber) {
  const args = ["internal/plugin", fiber];
  let callbacks;
  try {
    callbacks = context.events.dispatch("emit", args);
  } catch (error) {
    context.logger.error(error);
    return;
  }
  for (const callback of callbacks) {
    try {
      const returned = callback(...args);
      void Promise.resolve(returned).catch((error) => context.logger.error(error));
    } catch (error) {
      context.logger.error(error);
    }
  }
}
var CordisError = class _CordisError extends Error {
  /**
   * @param code — the stable error code; also the default message.
   * @param message — optional human-readable override.
   */
  constructor(code, message) {
    super(message ?? _CordisError.Code[code]);
    this.code = code;
  }
};
((CordisError2) => {
  CordisError2.Code = {
    INACTIVE_EFFECT: "cannot create effect on inactive context"
  };
})(CordisError || (CordisError = {}));
var INACTIVE = "__INACTIVE__";
var Fiber = class {
  /**
   * Create a fiber. Plugin authors normally obtain fibers from `ctx.plugin()`
   * rather than constructing them directly.
   *
   * @param parent — the context the plugin was loaded from.
   * @param config — raw config, validated against the runtime's schema.
   * @param inject — resolved dependency map (service name → intercept config).
   * @param runtime — the shared plugin runtime, or `null` for the root fiber.
   * @param getOuterStack — captures the caller stack for effect diagnostics.
   */
  constructor(parent, config, inject, runtime, getOuterStack) {
    this.parent = parent;
    this.inject = inject;
    this.runtime = runtime;
    this.config = config;
    const collect = (dispose) => {
      this._disposables.push(dispose);
    };
    if (runtime) {
      this.uid = parent.registry.counter;
      this.ctx = this.context = parent.extend({ fiber: this });
      const injectEntries = Object.entries(this.inject);
      if (injectEntries.length) {
        this.ctx[Context.intercept] = Object.create(parent[Context.intercept]);
        for (const [name, config2] of injectEntries) {
          if (isNullable(config2)) continue;
          this.ctx[Context.intercept][name] = config2;
        }
      }
      this._runner = {
        epoch: INACTIVE,
        getOuterStack,
        execute: function() {
          const config2 = this.resolveConfig(this.config);
          this._effectiveConfig = config2;
          if (isConstructor(runtime.callback)) {
            const instance = new runtime.callback(this.ctx, config2);
            for (const hook of instance?.[symbols.initHooks] ?? []) {
              hook();
            }
            return instance?.[symbols.init]?.();
          } else {
            return runtime.callback(this.ctx, config2);
          }
        },
        collect
      };
      this.dispose = parent.fiber.effect(() => {
        const remove = runtime.fibers.push(this);
        return async () => {
          this.uid = null;
          emitPluginDisposed(this.context, this);
          if (this.ctx.registry.has(runtime.callback)) {
            remove();
            if (!runtime.fibers.length) {
              this.ctx.registry.delete(runtime.callback);
            }
          }
          this._setEpoch(INACTIVE);
          if (!this.inertia) {
            this._updateState(() => {
              this.inertia = this._unload();
              return 5 /* UNLOADING */;
            });
          }
          while (this.inertia) {
            await this.inertia;
          }
        };
      }, "ctx.plugin()");
      try {
        this.context.emit("internal/plugin", this);
      } catch (error) {
        void Promise.resolve(this.dispose()).catch((reason) => this.ctx.logger.error(reason));
        throw error;
      }
      if (this.uid !== null && parent.fiber.state !== 5 /* UNLOADING */) {
        for (const name of Object.keys(this.inject)) {
          this._checkImpl(name);
        }
        this._refresh();
      }
    } else {
      this.uid = 0;
      this.ctx = this.context = parent;
      this.state = 2 /* ACTIVE */;
      this.committed = /* @__PURE__ */ Object.create(null);
      this._runner = {
        epoch: "0",
        getOuterStack,
        execute: () => {
        },
        collect
      };
      this.dispose = () => this.restart();
    }
  }
  /** Unique id within the registry; 0 for the root fiber, `null` once disposed. */
  uid;
  /** The context this fiber's plugin runs in (extends the parent context). */
  ctx;
  /** Raw plugin input retained for the next activation. */
  config;
  /** Current lifecycle state; transitions emit `internal/status`. */
  state = 0 /* PENDING */;
  /** Dispose this fiber: unload the plugin, then settle once cleanup finished. */
  dispose;
  /** Required implementations retained through dependent teardown. */
  committed;
  /** Service implementations owned by this fiber, including isolated provisions. */
  provisions = /* @__PURE__ */ new Set();
  /** The in-flight load/unload transition, if one is currently running. */
  inertia;
  _hooks = /* @__PURE__ */ Object.create(null);
  _disposables = new DisposableList();
  // Same as `this.ctx`, but with a more specific type.
  context;
  _error;
  _revision = 0;
  _configRevision = 0;
  _effectiveConfig;
  _runner;
  _store = /* @__PURE__ */ Object.create(null);
  _release;
  /** The plugin's display name, inherited from the nearest named ancestor, else `'root'`. */
  get name() {
    let fiber = this;
    do {
      if (fiber.runtime?.name) return fiber.runtime.name;
      fiber = fiber.parent.fiber;
    } while (fiber !== fiber.parent.fiber);
    return "root";
  }
  /**
   * Throw if the fiber has already been disposed.
   *
   * @returns nothing when the fiber is still active.
   * @throws {CordisError} `INACTIVE_EFFECT` when the fiber's uid has been cleared.
   */
  assertActive() {
    if (this.uid !== null) return;
    throw new CordisError("INACTIVE_EFFECT");
  }
  _execute(runner) {
    const oldEpoch = runner.epoch;
    return composeError((info) => {
      const safeCollect = (dispose) => {
        if (typeof dispose === "function") {
          runner.collect(dispose);
        } else if (!isNullable(dispose)) {
          throw new TypeError("Invalid effect");
        }
      };
      const effect = runner.execute.call(this);
      if (typeof effect === "function") {
        return runner.collect(effect);
      } else if (isNullable(effect)) {
      } else if (!isObject(effect)) {
        throw new TypeError("Invalid effect");
      } else if ("then" in effect) {
        return effect.then(safeCollect);
      } else if (Symbol.iterator in effect) {
        info.error = new Error();
        const iter = effect[Symbol.iterator]();
        while (true) {
          const result = iter.next();
          safeCollect(result.value);
          if (result.done) return;
        }
      } else if (Symbol.asyncIterator in effect) {
        const iter = effect[Symbol.asyncIterator]();
        return (async () => {
          await Promise.resolve();
          info.error = new Error();
          while (true) {
            if (runner.epoch !== oldEpoch) return;
            const result = await iter.next();
            safeCollect(result.value);
            if (result.done) return;
          }
        })();
      } else {
        throw new TypeError("Invalid effect");
      }
    }, runner.getOuterStack);
  }
  effect(execute, label = "anonymous") {
    this.assertActive();
    if (this.state === 5 /* UNLOADING */) {
      throw new CordisError("INACTIVE_EFFECT");
    }
    const disposables = [];
    let disposing = false;
    let disposalTask;
    const dispose = () => {
      if (disposing) return disposalTask;
      disposing = true;
      let task2;
      for (const disposable of disposables.splice(0).reverse()) {
        if (task2) {
          task2 = task2.then(() => runDisposable(disposable));
        } else {
          const result = runDisposable(disposable);
          if (isObject(result) && "then" in result) {
            task2 = result;
          }
        }
      }
      return disposalTask = task2;
    };
    const meta = { label, children: [] };
    const runner = {
      execute,
      epoch: true,
      collect: (dispose2) => {
        disposables.push(dispose2);
        this._disposables.delete(dispose2);
        if (dispose2[symbols.effect]) {
          meta.children.push(dispose2[symbols.effect]);
        }
      },
      getOuterStack: buildOuterStack()
    };
    let task;
    let executing = true;
    let resolveSetup;
    let rejectSetup;
    let setupBarrier;
    let setupFailed = false;
    let inFlight;
    let removeWrapper = () => false;
    const waitForSetup = () => {
      setupBarrier ??= new Promise((resolve3, reject) => {
        resolveSetup = resolve3;
        rejectSetup = reject;
      });
      return setupBarrier;
    };
    const disposeAfter = (setup) => {
      return Promise.resolve(setup).then(
        () => dispose(),
        async (reason) => {
          await dispose();
          throw reason;
        }
      );
    };
    const finalizeDisposal = (callback) => {
      let result;
      try {
        result = callback();
      } catch (error) {
        removeWrapper();
        throw error;
      }
      if (isObject(result) && "then" in result) {
        const pending = Promise.resolve(result).finally(() => {
          removeWrapper();
          if (inFlight === pending) inFlight = void 0;
        });
        return inFlight = pending;
      }
      removeWrapper();
      return result;
    };
    const wrapper = defineProperty(() => {
      if (!runner.epoch) return setupFailed ? inFlight : void 0;
      runner.epoch = false;
      return finalizeDisposal(() => {
        if (executing) return disposeAfter(waitForSetup());
        return task ? disposeAfter(task) : dispose();
      });
    }, symbols.effect, meta);
    effectInertia.set(wrapper, () => inFlight);
    removeWrapper = this._disposables.push(wrapper);
    try {
      task = this._execute(runner);
    } catch (reason) {
      executing = false;
      setupFailed = true;
      runner.epoch = false;
      let cleanup;
      try {
        cleanup = finalizeDisposal(dispose);
      } finally {
        rejectSetup?.(reason);
      }
      if (isObject(cleanup) && "then" in cleanup) {
        cleanup.catch((error) => this.ctx.logger.error(error));
      }
      throw reason;
    }
    executing = false;
    if (setupBarrier) {
      Promise.resolve(task).then(resolveSetup, rejectSetup);
    }
    task?.catch(() => {
      if (!runner.epoch) return dispose();
      return finalizeDisposal(dispose);
    }).catch((error) => this.ctx.logger.error(error));
    const disposeAsync = () => {
      if (!runner.epoch) return;
      runner.epoch = false;
      return finalizeDisposal(dispose);
    };
    wrapper.then = async (onFulfilled, onRejected) => {
      return Promise.resolve(task).then(() => disposeAsync).then(onFulfilled, onRejected);
    };
    return wrapper;
  }
  /**
   * Return metadata for currently registered effects.
   *
   * @returns one {@link EffectMeta} tree per labeled live effect.
   */
  getEffects() {
    return [...this._disposables].map((dispose) => dispose[symbols.effect]).filter(Boolean);
  }
  _getState() {
    if (this.uid === null) return 4 /* DISPOSED */;
    if (this._error) return 3 /* FAILED */;
    if (this._runner.epoch !== INACTIVE) return 2 /* ACTIVE */;
    return 0 /* PENDING */;
  }
  _updateState(callback) {
    const oldState = this.state;
    this.state = callback() ?? this._getState();
    if (oldState === this.state) return;
    this.context.emit("internal/status", this, oldState);
    if (oldState !== 2 /* ACTIVE */ && this.state !== 2 /* ACTIVE */) return;
    for (const key of Reflect.ownKeys(this.ctx.reflect.store)) {
      const impl = this.ctx.reflect.store[key];
      if (impl.ctx.fiber !== this) continue;
      this.ctx.isolate(impl.name, impl.isolate).reflect.notify([impl.name]);
    }
  }
  _checkImpl(name) {
    const impl = this.ctx.reflect._getImpl(name, true);
    if (!impl) return delete this._store[name];
    try {
      if (impl.check && !impl.check.call(getTraceable(this.ctx, impl.value))) {
        return delete this._store[name];
      }
    } catch (error) {
      impl.ctx.logger.error(error);
      return delete this._store[name];
    }
    this._store[name] = impl;
  }
  _refresh() {
    let epoch = `${this._revision}`;
    for (const name of Object.keys(this.inject)) {
      const impl = this._store[name];
      if (!impl) {
        epoch = INACTIVE;
        break;
      }
      epoch += ":" + impl.uid;
    }
    this._setEpoch(epoch);
  }
  _setEpoch(epoch) {
    const oldEpoch = this._runner.epoch;
    if (epoch === oldEpoch) return;
    if (this._error) return;
    this._runner.epoch = epoch;
    if (this.inertia) return;
    this._updateState(() => {
      if (epoch !== INACTIVE && oldEpoch === INACTIVE) {
        this.inertia = this._reload();
        return 1 /* LOADING */;
      } else {
        this.inertia = this._unload();
        return 5 /* UNLOADING */;
      }
    });
  }
  /** Raw input retained for the next activation, without evaluating expressions or validating it. */
  get rawConfig() {
    return this.ctx.fiber.config;
  }
  /** Retain raw input without changing the running config or triggering an update. */
  set rawConfig(config) {
    this.ctx.fiber.config = config;
    this.ctx.fiber._configRevision++;
  }
  /**
   * The object passed to plugin activation or the latest successful update that retained the instance.
   * Candidate resolution does not publish it; volatile updates retain its references.
   * Undefined before activation and readable after unload; callers requiring a live instance check `state`.
   */
  get effectiveConfig() {
    return this.ctx.fiber._effectiveConfig;
  }
  /**
   * Evaluate and validate a candidate using this fiber's `internal/config` hooks and runtime schema.
   * Does not publish the result, replace raw input, or commit running volatile references.
   * Required injections must be available when a hook uses them.
   * @param config Raw candidate input.
   * @returns The candidate's resolved config, retaining the schema's result identity.
   * @throws {ValidationError} when the runtime schema rejects the candidate; hook errors propagate.
   */
  resolveConfig(config) {
    const fiber = this.ctx.fiber;
    return fiber.context.waterfall("internal/config", fiber, () => config);
  }
  async _reload() {
    this.committed = { ...this._store };
    for (const impl of Object.values(this.committed)) {
      if (impl.ctx.fiber === this) continue;
      impl.dependents.add(this);
    }
    const oldEpoch = this._runner.epoch;
    try {
      await Promise.resolve();
      if (this._runner.epoch === oldEpoch) {
        await this._execute(this._runner);
      }
    } catch (reason) {
      this.ctx.logger.error(reason);
      if (this._runner.epoch === oldEpoch) {
        this._error = reason;
        this._runner.epoch = INACTIVE;
      }
    }
    this._updateState(() => {
      if (this._runner.epoch === oldEpoch) {
        this.inertia = void 0;
      } else {
        this.inertia = this._unload();
        return 5 /* UNLOADING */;
      }
    });
  }
  async _unload() {
    while ([...this.provisions].some((impl) => impl.dependents.size)) {
      await new Promise((resolve3) => this._release = resolve3);
    }
    this._release = void 0;
    await Promise.all(this._disposables.clear().map(async (dispose) => {
      try {
        await composeError(async (info) => {
          await Promise.resolve();
          info.error = new Error();
          await runDisposable(dispose);
        }, this._runner.getOuterStack);
      } catch (reason) {
        this.ctx.logger.error(reason);
      }
    }));
    for (const impl of Object.values(this.committed ?? {})) {
      if (!impl.dependents.delete(this) || impl.dependents.size) continue;
      impl.release?.();
      impl.ctx.fiber._release?.();
    }
    this.committed = void 0;
    this._updateState(() => {
      if (this._runner.epoch === INACTIVE) {
        this.inertia = void 0;
      } else {
        this.inertia = this._reload();
        return 1 /* LOADING */;
      }
    });
  }
  /**
   * Wait for current lifecycle work and rethrow startup errors.
   *
   * @returns this fiber, once it has settled into a stable state.
   * @throws the config-validation or plugin-startup error, if any.
   */
  async await() {
    while (this.inertia) {
      await this.inertia;
    }
    if (this._error) throw this._error;
    return this;
  }
  /**
   * Dispose and immediately reload this plugin with its current config.
   *
   * @returns a promise resolving once the reload settled.
   * @throws {CordisError} `INACTIVE_EFFECT` when the fiber is already disposed.
   */
  async restart() {
    const fiber = this.ctx.fiber;
    fiber.assertActive();
    fiber._revision++;
    fiber._refresh();
    await fiber.await();
  }
  /**
   * Resolve a candidate, retain its raw config and apply it through the update waterfall.
   * @param config Raw config; pending fibers defer resolution until activation.
   * @param noSave Suppress the persistence notification when true.
   * @returns The awaited update/restart result, or undefined when a synchronous listener handles it.
   * @throws {ValidationError} when an active fiber's candidate is invalid.
   */
  update(config, noSave = false) {
    const fiber = this.ctx.fiber;
    fiber.assertActive();
    const loaded = fiber._runner.epoch !== INACTIVE;
    const resolved = loaded ? fiber.resolveConfig(config) : void 0;
    if (!noSave) fiber.context.emit("internal/commit", fiber, config);
    fiber.config = config;
    fiber._error = void 0;
    const configRevision = ++fiber._configRevision;
    const epoch = fiber._runner.epoch;
    const committed = fiber.committed;
    let restarted = false;
    const restart = () => {
      restarted = true;
      return fiber.restart();
    };
    const publish = () => {
      if (!restarted && fiber.uid !== null && fiber._configRevision === configRevision && fiber._runner.epoch === epoch && fiber.committed === committed) {
        fiber._effectiveConfig = resolved;
      }
    };
    const result = loaded ? fiber.context.waterfall(fiber, "internal/update", resolved, restart) : restart();
    if (result === void 0) {
      publish();
      return;
    }
    const task = Promise.resolve(result).then(publish);
    task.catch(() => {
    });
    return task;
  }
};

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/vendor/cordis/src/events.ts
function isBailed(value) {
  return value !== null && value !== false && value !== void 0;
}
var EventsService = class {
  constructor(ctx) {
    this.ctx = ctx;
    defineProperty(this, symbols.tracker, {
      property: "ctx",
      noShadow: true
    });
    this.on("internal/listener", function(name, listener, options) {
      if (name === "internal/update" && !options.global) {
        const hooks = this.fiber._hooks["internal/update"] ??= new DisposableList();
        const method = options.prepend ? "unshift" : "push";
        return this.fiber.effect(() => hooks[method](listener), 'ctx.on("internal/update")');
      }
    });
    this.on("internal/update", function(config, next) {
      const cbs = [...this._hooks["internal/update"] || []];
      const _next = () => {
        const cb = cbs.shift() ?? next;
        return cb.call(this, config, _next);
      };
      return _next();
    }, { global: true, prepend: true });
    this.on("internal/config", (fiber, next) => {
      const config = next();
      return fiber.runtime ? resolveConfig(fiber.runtime, config) : config;
    });
  }
  _hooks = /* @__PURE__ */ Object.create(null);
  _resolve(type, args) {
    const thisArg = typeof args[0] === "object" || typeof args[0] === "function" ? args.shift() : null;
    const name = args.shift();
    if ((typeof name !== "string" || !name.startsWith("internal/")) && this._hooks["internal/dispatch"]?.length) {
      this.emit("internal/dispatch", type, name, args, thisArg);
    }
    const filter = thisArg?.[Context.filter];
    return [thisArg, (this._hooks[name] || []).filter((hook) => hook.global || !filter || filter.call(thisArg, hook.ctx)).map((hook) => hook.callback)];
  }
  /**
   * Resolve bound callbacks using the event's context filter.
   * @param type Dispatch mode reported to observers.
   * @param args Dispatch arguments, consumed through the event name.
   * @returns Matching callbacks bound to the dispatch receiver.
   * DSH retains callback enumeration for per-listener error containment.
   */
  dispatch(type, args) {
    const [thisArg, callbacks] = this._resolve(type, args);
    return callbacks.map((callback) => callback.bind(thisArg));
  }
  /**
   * Run listeners concurrently and wait for all of them.
   *
   * @param args — optional `this`, the event name, then listener arguments.
   * @returns a promise resolving once every listener has settled.
   */
  async parallel(...args) {
    const [thisArg, callbacks] = this._resolve("parallel", args);
    const results = await Promise.allSettled(callbacks.map(async (callback) => Reflect.apply(callback, thisArg, args)));
    const errors = results.filter((result) => result.status === "rejected");
    if (errors.length) throw new AggregateError(errors.map((error) => error.reason));
  }
  /**
   * Run listeners synchronously without waiting for returned promises.
   *
   * @param args — optional `this`, the event name, then listener arguments.
   */
  emit(...args) {
    const [thisArg, callbacks] = this._resolve("emit", args);
    for (const callback of callbacks) Reflect.apply(callback, thisArg, args);
  }
  /**
   * Run listeners in order, awaiting each, until one returns a bail value.
   *
   * @param args — optional `this`, the event name, then listener arguments.
   * @returns the first bail value (see {@link isBailed}), if any.
   */
  async serial(...args) {
    const [thisArg, callbacks] = this._resolve("serial", args);
    for (const callback of callbacks) {
      const result = await Reflect.apply(callback, thisArg, args);
      if (isBailed(result)) return result;
    }
  }
  /**
   * Run listeners synchronously until one returns a bail value.
   *
   * @param args — optional `this`, the event name, then listener arguments.
   * @returns the first bail value (see {@link isBailed}), if any.
   */
  bail(...args) {
    const [thisArg, callbacks] = this._resolve("bail", args);
    for (const callback of callbacks) {
      const result = Reflect.apply(callback, thisArg, args);
      if (isBailed(result)) return result;
    }
  }
  /**
   * Compose listeners around the final `next` callback.
   *
   * The last dispatch argument is treated as the innermost `next`. Listeners
   * run outermost-first; a listener that does not call `next()` vetoes the
   * rest of the chain, including the built-in behavior.
   *
   * @param args — optional `this`, the event name, listener arguments, then `next`.
   * @returns the outermost listener's return value.
   */
  waterfall(...args) {
    const [thisArg, callbacks] = this._resolve("waterfall", args);
    const inner = args.pop();
    const dispatch = () => {
      const callback = callbacks.shift();
      if (!callback) return inner();
      let called = false;
      const next = () => {
        if (called) throw new Error("next() called multiple times");
        called = true;
        return dispatch();
      };
      return Reflect.apply(callback, thisArg, [...args, next]);
    };
    return dispatch();
  }
  register(label, name, callback, options) {
    const method = options.prepend ? "unshift" : "push";
    return this.ctx.fiber.effect(() => {
      const hooks = this._hooks[name] ??= [];
      hooks[method]({ ctx: this.ctx, callback, ...options });
      return () => this.unregister(name, callback);
    }, label);
  }
  unregister(name, callback) {
    const hooks = this._hooks[name];
    if (!hooks) return;
    const index = hooks.findIndex((hook) => hook.callback === callback);
    if (index >= 0) {
      hooks.splice(index, 1);
      if (!hooks.length) delete this._hooks[name];
      return true;
    }
  }
  /**
   * Register an event listener owned by the current fiber.
   *
   * The listener is removed automatically when the fiber unloads. Throws
   * `CordisError('INACTIVE_EFFECT')` if the fiber is already disposed.
   *
   * @param name — the event name to listen for.
   * @param listener — called with the dispatch arguments.
   * @param options — listener options; a boolean is shorthand for `prepend`.
   * @returns a disposer removing the listener; `true` if it was still registered.
   */
  on(name, listener, options) {
    if (typeof options !== "object") {
      options = { prepend: options };
    }
    this.ctx.fiber.assertActive();
    listener = this.ctx.reflect.bind(listener);
    const result = this.bail(this.ctx, "internal/listener", name, listener, options);
    if (result) return result;
    const label = `ctx.on(${typeof name === "string" ? JSON.stringify(name) : name.toString()})`;
    return this.register(label, name, listener, options);
  }
  /**
   * Register an event listener that disposes itself after the first call.
   *
   * @param name — the event name to listen for.
   * @param listener — called at most once with the dispatch arguments.
   * @param options — listener options; a boolean is shorthand for `prepend`.
   * @returns a disposer removing the listener; `true` if it was still registered.
   */
  once(name, listener, options) {
    const dispose = this.on(name, function(...args) {
      dispose();
      return listener.apply(this, args);
    }, options);
    return dispose;
  }
};

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/vendor/cordis/src/logger.ts
var defaultFormatters = {
  s: (value) => String(value),
  d: (value) => Math.trunc(Number(value)),
  i: (value) => Math.trunc(Number(value)),
  f: (value) => Number(value),
  o: (value) => JSON.stringify(value),
  O: (value) => JSON.stringify(value),
  c: () => "",
  C: (value, exporter, message) => {
    return Logger.color(exporter, Logger.code(message.name, exporter.colors), value);
  }
};
function isAggregateError(error) {
  return error instanceof Error && Array.isArray(error["errors"]);
}
var Logger = class {
  constructor(options, service) {
    this.service = service;
    Object.assign(this, options);
    this.error = this._method("error", 0 /* ERROR */);
    this.info = this._method("info", 2 /* INFO */);
    this.warn = this._method("warn", 1 /* WARN */);
    this.debug = this._method("debug", 3 /* DEBUG */);
  }
  static color(exporter, code, value, decoration = "") {
    if (!exporter.colors) return "" + value;
    return `\x1B[3${code < 8 ? code : "8;5;" + code}${exporter.colors >= 2 ? decoration : ""}m${value}\x1B[0m`;
  }
  static code(name, level) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash << 3) - hash + name.charCodeAt(i) + 13;
      hash |= 0;
    }
    const colors = !level ? [] : level >= 2 ? c256 : c16;
    return colors[Math.abs(hash) % colors.length];
  }
  static format(exporter, message) {
    const args = message.args.slice();
    if (args[0] instanceof Error) {
      args[0] = args[0].stack || args[0].message;
      args.unshift("%s");
    } else if (typeof args[0] !== "string") {
      args.unshift("%o");
    }
    let format = args.shift();
    format = format.replace(/%([a-zA-Z%])/g, (match, char) => {
      if (match === "%%") return "%";
      const formatter = exporter.formatters?.[char] ?? defaultFormatters[char];
      if (typeof formatter === "function") {
        const value = args.shift();
        return formatter(value, exporter, message);
      }
      return match;
    });
    const oFormatter = exporter.formatters?.o ?? defaultFormatters.o;
    for (let arg of args) {
      if (typeof arg === "object" && arg) {
        arg = oFormatter(arg, exporter, message);
      }
      format += " " + arg;
    }
    const { maxLength = 10240 } = exporter;
    return format.split(/\r?\n/g).map((line) => {
      return line.slice(0, maxLength) + (line.length > maxLength ? "..." : "");
    }).join("\n");
  }
  _method(type, level) {
    return (...args) => {
      if (args.length === 1 && args[0] instanceof Error) {
        if (args[0].cause) {
          this[type](args[0].cause);
        } else if (isAggregateError(args[0])) {
          args[0].errors.forEach((error) => this[type](error));
          return;
        }
      }
      const sn = ++this.service._snMessage;
      const ts = Date.now();
      for (const exporter of this.service.exporters.values()) {
        const targetLevel = exporter.levels?.[this.name] ?? exporter.levels?.default ?? this.level ?? 2 /* INFO */;
        if (targetLevel < level) continue;
        const message = { sn, ts, type, level, name: this.name, ...this.meta, args };
        exporter.export(message);
      }
    };
  }
};
var c16 = [6, 2, 3, 4, 5, 1];
var c256 = [
  20,
  21,
  26,
  27,
  32,
  33,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  56,
  57,
  62,
  63,
  68,
  69,
  74,
  75,
  76,
  77,
  78,
  79,
  80,
  81,
  92,
  93,
  98,
  99,
  112,
  113,
  129,
  134,
  135,
  148,
  149,
  160,
  161,
  162,
  163,
  164,
  165,
  166,
  167,
  168,
  169,
  170,
  171,
  172,
  173,
  178,
  179,
  184,
  185,
  196,
  197,
  198,
  199,
  200,
  201,
  202,
  203,
  204,
  205,
  206,
  207,
  208,
  209,
  214,
  215,
  220,
  221
];
var LoggerService = class _LoggerService {
  bufferSize = 1e3;
  buffer = [];
  ctx;
  _snMessage = 0;
  _snExporter = 0;
  exporters = /* @__PURE__ */ new Map();
  constructor(ctx) {
    const tracker = {
      property: "ctx",
      noShadow: true
    };
    const self = createCallable("logger", joinPrototype(Object.getPrototypeOf(this), Function.prototype), tracker);
    Object.assign(self, this);
    self.ctx = ctx;
    defineProperty(self, symbols.tracker, tracker);
    self.exporter({
      colors: 3,
      export: (message) => {
        self.buffer.push(message);
        const overflow = self.buffer.length - self.bufferSize;
        if (overflow === 1) {
          self.buffer.shift();
        } else if (overflow > 1) {
          self.buffer.splice(0, overflow);
        }
      }
    });
    return self;
  }
  /**
   * Register an exporter and dispose it with the current fiber.
   *
   * @param exporter — the sink that receives structured log messages.
   * @returns a disposer that removes the exporter.
   */
  exporter(exporter) {
    return this.ctx.effect(() => {
      const id = ++this._snExporter;
      this.exporters.set(id, exporter);
      return () => this.exporters.delete(id);
    }, "ctx.logger.exporter()");
  }
  _resolveConfig() {
    let intercept = this.ctx[symbols.intercept];
    const configs = [];
    while ("logger" in intercept) {
      if (Object.hasOwn(intercept, "logger")) {
        configs.unshift(intercept["logger"]);
      }
      intercept = Object.getPrototypeOf(intercept);
    }
    return Object.assign({}, ...configs);
  }
  [symbols.invoke](name) {
    const config = this._resolveConfig();
    const caller = this[symbols.caller];
    const fiber = (caller ?? this.ctx).fiber;
    name ??= config.name;
    name ??= hyphenate(fiber.name);
    return new Logger({
      name,
      level: config.level,
      meta: { fiber: new WeakRef(fiber) }
    }, this);
  }
  static {
    for (const type of ["error", "info", "warn", "debug"]) {
      ;
      _LoggerService.prototype[type] = function(...args) {
        return this()[type](...args);
      };
    }
  }
};

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/vendor/cordis/src/reflect.ts
function enhanceError(error) {
  const lines = error.stack.split("\n");
  lines.splice(0, 2, `Error: ${error.message}`);
  error.stack = lines.join("\n");
  return error;
}
var RESERVED_WORDS = ["prototype", "then"];
function isSpecialProperty(prop) {
  return typeof prop === "symbol" || RESERVED_WORDS.includes(prop) || parseInt(prop).toString() === prop || prop.startsWith("_");
}
var ReflectService = class {
  constructor(ctx) {
    this.ctx = ctx;
    defineProperty(this, symbols.tracker, {
      property: "ctx",
      noShadow: true
    });
    this.mixin("reflect", ["get", "set", "provide", "accessor", "mixin"]);
    this.mixin("fiber", ["runtime", "effect"]);
    this.mixin("registry", ["inject", "plugin"]);
    this.mixin("events", ["on", "once", "parallel", "emit", "serial", "bail", "waterfall"]);
  }
  /** Proxy traps implementing service resolution for every context object. */
  static handler = {
    get: (target, prop, ctx) => {
      if (isSpecialProperty(prop)) {
        return Reflect.get(target, prop, ctx);
      }
      if (Reflect.has(target, prop)) {
        return getTraceable(ctx, Reflect.get(target, prop, ctx));
      }
      const error = new Error(`cannot get property "${prop}" without inject`);
      try {
        const def = target.reflect.props[prop];
        if (def?.type === "accessor") {
          return def.get.call(ctx, ctx[symbols.receiver], error);
        }
        const defSite = ctx[symbols.shadow] ?? ctx;
        if (!defSite.fiber.runtime) return ctx.reflect.get(prop, false);
        return ctx.events.waterfall("internal/get", ctx, prop, error, () => {
          const key = defSite[symbols.isolate][prop];
          let fiber = defSite.fiber;
          while (true) {
            let impl = fiber.committed?.[prop];
            for (const provision of fiber.provisions) {
              if (provision.name === prop && provision.ctx[symbols.isolate][prop] === key) impl = provision;
            }
            if (impl) return getTraceable(ctx, impl.value);
            if (prop in fiber.inject) {
              error.message = `cannot get required service "${prop}" in inactive context`;
              throw error;
            }
            if (!fiber.runtime) throw error;
            if (fiber.parent[symbols.isolate][prop] !== key) throw error;
            fiber = fiber.parent.fiber;
          }
        });
      } catch (e) {
        throw e === error ? enhanceError(e) : e;
      }
    },
    set: (target, prop, value, ctx) => {
      if (isSpecialProperty(prop)) {
        return Reflect.set(target, prop, value, ctx);
      }
      const error = new Error(`cannot set property "${prop}" without provide`);
      const def = target.reflect.props[prop];
      if (!def) {
        if (!ctx.fiber.runtime) return Reflect.set(target, prop, value, ctx);
        throw enhanceError(error);
      }
      try {
        if (def.type === "accessor") {
          if (!def.set) return false;
          return def.set.call(ctx, value, ctx[symbols.receiver], error);
        }
        return ctx.events.waterfall("internal/set", ctx, prop, value, error, () => {
          return ctx.reflect.set(prop, value, error);
        });
      } catch (e) {
        throw e === error ? enhanceError(e) : e;
      }
    },
    has: (target, prop) => {
      if (isSpecialProperty(prop)) {
        return Reflect.has(target, prop);
      }
      if (Reflect.has(target, prop)) return true;
      return !!target.reflect.props[prop];
    }
  };
  /** Service implementations, keyed by isolation label. */
  store = /* @__PURE__ */ Object.create(null);
  /** Declared context properties (services and accessors), by name. */
  props = /* @__PURE__ */ Object.create(null);
  _implCounter = 0;
  /**
   * Read a service from the store without the inject requirement.
   *
   * @param name — the service name.
   * @param strict — when `true`, only return implementations whose providing
   * fiber is currently active.
   * @returns the service value, or `undefined` when not (yet) provided.
   */
  get(name, strict = true) {
    return getTraceable(this.ctx, this._getImpl(name, strict)?.value);
  }
  _getImpl(name, strict = true) {
    const key = this.ctx[symbols.isolate][name];
    const impl = key && this.store[key];
    if (!impl) return;
    if (strict && impl.ctx.fiber.state !== 2 /* ACTIVE */) return;
    return impl;
  }
  /**
   * Overwrite a provided service's value.
   *
   * @param name — the service name.
   * @param value — the new service value.
   * @param error — carrier for the caller stack in diagnostics.
   * @returns `true` on success.
   * @throws when `name` was never provided, or was provided by another fiber.
   */
  set(name, value, error) {
    const key = this.ctx[symbols.isolate][name];
    const impl = this.store[key];
    if (!impl) {
      throw new Error(`cannot set property "${name}" without provide`);
    }
    if (impl.ctx.fiber !== this.ctx.fiber) {
      throw new Error(`cannot set property "${name}" in multiple fibers`);
    }
    impl.value = value;
    return true;
  }
  /**
   * Register a service implementation owned by the current fiber.
   *
   * See the `ctx.provide()` overload above for the full contract.
   *
   * @param name — the service name.
   * @param value — the service value.
   * @param check — optional availability predicate for dependents.
   * @returns a disposer that unregisters the service.
   */
  provide(name, value, check) {
    return this.ctx.fiber.effect(() => {
      if (!this.props[name]) {
        this.props[name] ??= { type: "service" };
      } else if (this.props[name].type !== "service") {
        throw new Error(`property "${name}" is already declared as ${this.props[name].type}`);
      }
      this.props[name] = { type: "service" };
      this.ctx.root[symbols.isolate][name] ??= Symbol(name);
      const key = this.ctx[symbols.isolate][name];
      const impl = { uid: ++this._implCounter, name, value, ctx: this.ctx, check, isolate: key, dependents: /* @__PURE__ */ new Set() };
      if (this.store[key]) {
        throw new Error(`service "${name}" has been registered at <${this.store[key].ctx.fiber.name}>`);
      }
      this.store[key] = impl;
      this.ctx.fiber.provisions.add(impl);
      if (this.ctx.fiber.state === 2 /* ACTIVE */) {
        this.notify([name]);
      }
      return async () => {
        if (this.store[impl.isolate] === impl) delete this.store[impl.isolate];
        this.ctx.isolate(name, impl.isolate).reflect.notify([name]);
        await new Promise((resolve3) => {
          impl.release = resolve3;
          if (!impl.dependents.size) resolve3();
        });
        impl.release = void 0;
        this.ctx.fiber.provisions.delete(impl);
      };
    }, `ctx.provide(${JSON.stringify(name)})`);
  }
  /**
   * Re-evaluate every fiber that requires one of the given services.
   *
   * @param names — the service names that changed.
   * @param filter — restricts notification to matching isolation scopes.
   */
  notify(names, filter = (ctx, name) => ctx[symbols.isolate][name] === this.ctx[symbols.isolate][name]) {
    for (const runtime of this.ctx.registry.values()) {
      for (const fiber of runtime.fibers) {
        let hasUpdate = false;
        for (const name of names) {
          if (!(name in fiber.inject)) continue;
          if (!filter(fiber.ctx, name)) continue;
          hasUpdate = true;
          fiber._checkImpl(name);
        }
        if (!hasUpdate) continue;
        fiber._refresh();
      }
    }
    for (const name of names) {
      const self = Object.create(this.ctx);
      self[symbols.filter] = (target) => filter(target, name);
      this.ctx.events.emit(self, "internal/service", name, this._getImpl(name, false)?.value);
    }
  }
  /**
   * Define a computed context property backed by get/set hooks.
   *
   * @param name — the context property name.
   * @param options — the `get` hook and optional `set` hook.
   * @returns a disposer that removes the accessor.
   */
  accessor(name, options) {
    return this.ctx.fiber.effect(() => {
      if (name in this.props) {
        throw new Error(`property "${name}" is already declared as ${this.props[name].type}`);
      }
      this.props[name] = { type: "accessor", ...options };
      return () => delete this.props[name];
    }, `ctx.accessor(${JSON.stringify(name)})`);
  }
  /**
   * Expose selected members of a service directly on `ctx`.
   *
   * See the `ctx.mixin()` overload above for the full contract.
   *
   * @param source — a context property name or a source object.
   * @param mixins — keys to forward, or a source-key → ctx-key map.
   * @returns a disposer that removes all created accessors.
   */
  mixin(source, mixins) {
    const self = this;
    return this.ctx.fiber.effect(function* () {
      const entries = Array.isArray(mixins) ? mixins.map((key) => [key, key]) : Object.entries(mixins);
      const getTarget = (ctx, error) => {
        return ctx[source];
      };
      for (const [key, value] of entries) {
        yield self.accessor(value, {
          get(receiver, error) {
            const service = getTarget(this, error);
            if (isNullable(service)) return service;
            const mixin = receiver ? withProps(receiver, service) : service;
            const value2 = Reflect.get(service, key, mixin);
            if (typeof value2 !== "function") return value2;
            return value2.bind(mixin ?? service);
          },
          set(value2, receiver, error) {
            const service = getTarget(this, error);
            const mixin = receiver ? withProps(receiver, service) : service;
            return Reflect.set(service, key, value2, mixin);
          }
        });
      }
    }, `ctx.mixin(${JSON.stringify(source)})`);
  }
  /**
   * Attach this context's tracing wrapper to a value.
   *
   * @param value — the value to wrap.
   * @returns the traceable wrapper (or the value itself when not applicable).
   */
  trace(value) {
    return getTraceable(this.ctx, value);
  }
  /**
   * Wrap a callback so calls trace `this` and arguments to this context.
   *
   * @param callback — the function to wrap.
   * @returns a proxy delegating to `callback` with traced values.
   */
  bind(callback) {
    return new Proxy(callback, {
      apply: (target, thisArg, args) => {
        return Reflect.apply(target, this.trace(thisArg), args.map((arg) => this.trace(arg)));
      },
      construct: (target, args, newTarget) => {
        return Reflect.construct(target, args.map((arg) => this.trace(arg)), newTarget);
      }
    });
  }
};

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/vendor/cordis/src/registry.ts
function isApplicable(object2) {
  return object2 && typeof object2 === "object" && typeof object2.apply === "function";
}
function Inject(name, config) {
  return function(value, decorator) {
    if (decorator.kind === "class") {
      if (!Object.hasOwn(value, "inject")) {
        defineProperty(value, "inject", Object.create(Object.getPrototypeOf(value).inject ?? null));
        defineProperty(value.inject, symbols.checkProto, true);
      }
      value.inject[name] = config;
    } else if (decorator.kind === "method") {
      const inject = (value[symbols.metadata] ??= {}).inject ??= /* @__PURE__ */ Object.create(null);
      inject[name] = config;
      decorator.addInitializer(function() {
        const property2 = this[symbols.tracker]?.property;
        (this[symbols.initHooks] ??= []).push(() => {
          this.ctx.inject(inject, (ctx) => {
            return value.call(property2 ? withProps(this, { [property2]: ctx }) : this);
          });
        });
      });
    } else {
      throw new Error("@Inject() can only be used on class or class methods");
    }
  };
}
((Inject2) => {
  function resolve3(inject, result = /* @__PURE__ */ Object.create(null)) {
    if (!inject) return result;
    if (Array.isArray(inject)) {
      for (const name of inject) {
        result[name] = null;
      }
    } else if (Reflect.has(inject, symbols.checkProto)) {
      Object.assign(result, resolve3(Object.getPrototypeOf(inject)));
      for (const name of Object.keys(inject)) {
        result[name] = inject[name] ?? null;
      }
    } else {
      for (const name of Object.keys(inject)) {
        result[name] = inject[name] ?? null;
      }
    }
    return result;
  }
  Inject2.resolve = resolve3;
})(Inject || (Inject = {}));
var RegistryService = class {
  constructor(ctx) {
    this.ctx = ctx;
    defineProperty(this, symbols.tracker, {
      property: "ctx",
      noShadow: true
    });
  }
  _counter = 0;
  _internal = /* @__PURE__ */ new Map();
  /** Allocate the next fiber uid (increments on every read). */
  get counter() {
    return ++this._counter;
  }
  /** Number of registered plugin runtimes. */
  get size() {
    return this._internal.size;
  }
  /**
   * Resolve a supported plugin shape to its executable callback.
   *
   * @param plugin — a function, class, or `{ apply }` object plugin.
   * @returns the callback identifying the plugin, or `undefined` if invalid.
   */
  resolve(plugin) {
    try {
      if (typeof plugin === "function") return plugin;
      if (isApplicable(plugin)) return plugin.apply;
    } catch {
    }
  }
  /**
   * Look up the runtime record for a plugin.
   *
   * @param plugin — any supported plugin shape.
   * @returns the runtime, or `undefined` when the plugin is not registered.
   */
  get(plugin) {
    const key = this.resolve(plugin);
    return key && this._internal.get(key);
  }
  /**
   * Check whether a plugin has a registered runtime.
   *
   * @param plugin — any supported plugin shape.
   * @returns `true` when at least one fiber of the plugin exists.
   */
  has(plugin) {
    const key = this.resolve(plugin);
    return !!key && this._internal.has(key);
  }
  /**
   * Dispose every running fiber for a plugin and remove its runtime record.
   *
   * @param plugin — any supported plugin shape.
   * @returns the removed runtime, or `undefined` when none was registered.
   */
  delete(plugin) {
    const key = this.resolve(plugin);
    const runtime = key && this._internal.get(key);
    if (!runtime) return;
    this._internal.delete(key);
    for (const fiber of runtime.fibers) {
      fiber.dispose();
    }
    return runtime;
  }
  /** Iterate the registered plugin callbacks. */
  keys() {
    return this._internal.keys();
  }
  /** Iterate the registered plugin runtimes. */
  values() {
    return this._internal.values();
  }
  /** Iterate `[callback, runtime]` pairs. */
  entries() {
    return this._internal.entries();
  }
  /**
   * Visit every registered runtime.
   *
   * @param callback — receives each runtime and its identifying callback.
   */
  forEach(callback) {
    return this._internal.forEach(callback);
  }
  /**
   * Start a callback once the requested dependencies are available.
   *
   * @param inject — required services, as an array or a name → config map.
   * @param callback — plugin body called with `(ctx, config)`.
   * @returns the fiber; awaiting it settles once loading finished.
   */
  inject(inject, callback) {
    return this.plugin({ inject, apply: callback, name: callback.name });
  }
  /**
   * Start a plugin in the current context and return its fiber.
   *
   * Creates (or reuses) the plugin's runtime record, then starts a new fiber
   * under the current context. Throws if `plugin` is not a supported shape or
   * if the current fiber is already disposed.
   *
   * @param plugin — a function, class, or `{ apply }` object plugin.
   * @param config — the plugin config, validated against its `Config` schema.
   * @param getOuterStack — captures the caller stack for effect diagnostics.
   * @returns the fiber; awaiting it settles once loading finished.
   */
  plugin(plugin, config, getOuterStack = buildOuterStack()) {
    const callback = this.resolve(plugin);
    if (!callback) throw new Error('invalid plugin, expect function or object with an "apply" method, received ' + typeof plugin);
    this.ctx.fiber.assertActive();
    let runtime = this._internal.get(callback);
    if (!runtime) {
      let name = plugin.name;
      if (name === "apply") name = void 0;
      runtime = { name, callback, fibers: new DisposableList(), Config: plugin.Config };
      this._internal.set(callback, runtime);
    }
    const fiber = new Fiber(this.ctx, config, Inject.resolve(plugin.inject), runtime, getOuterStack);
    const wrapped = Object.create(fiber);
    wrapped.then = (onFulfilled, onRejected) => {
      return fiber.await().then(onFulfilled, onRejected);
    };
    return wrapped;
  }
};

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/vendor/cordis/src/context.ts
var Context = class _Context {
  /** Symbol key under which a disposer exposes its {@link EffectMeta} diagnostics tree. */
  static effect = symbols.effect;
  /** Symbol key for a context's listener filter, consulted on every event dispatch. */
  static filter = symbols.filter;
  /** Symbol key of the isolation map (see the `Context[symbols.isolate]` property). */
  static isolate = symbols.isolate;
  /** Symbol key of the intercept map (see the `Context[symbols.intercept]` property). */
  static intercept = symbols.intercept;
  /**
   * Returns true for Cordis context proxies and context prototypes.
   *
   * Works across realms and across multiple copies of cordis, because the
   * brand is keyed by a global symbol rather than by `instanceof`.
   *
   * @param value — the value to test.
   * @returns `true` if `value` is a Cordis context, narrowing its type.
   */
  static is(value) {
    return !!value?.[_Context.is];
  }
  static {
    _Context.is[Symbol.toPrimitive] = () => Symbol.for("cordis.is");
    _Context.prototype[_Context.is] = true;
  }
  /** Create the root context and install the built-in services. */
  constructor() {
    this[symbols.isolate] = /* @__PURE__ */ Object.create(null);
    this[symbols.intercept] = /* @__PURE__ */ Object.create(null);
    const self = new Proxy(this, ReflectService.handler);
    this.root = self;
    this.baseUrl = void 0;
    this.fiber = new Fiber(self, {}, /* @__PURE__ */ Object.create(null), null, () => []);
    this.reflect = new ReflectService(self);
    this.registry = new RegistryService(self);
    this.events = new EventsService(self);
    this.logger = new LoggerService(self);
    this.fiber._disposables.clear();
    return self;
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return `Context <${this.fiber.name}>`;
  }
  /**
   * Create a child context with extra metadata on top of the current scope.
   *
   * The child prototypally inherits every property of this context; own
   * properties of `meta` shadow the inherited ones. The parent is not mutated.
   *
   * @param meta — own properties (including symbol keys) to define on the child.
   * @returns a child context inheriting from this one.
   */
  extend(meta = {}) {
    const shadow = Reflect.getOwnPropertyDescriptor(this, symbols.shadow)?.value;
    const self = Object.create(getTraceable(this, this));
    for (const prop of Reflect.ownKeys(meta)) {
      Object.defineProperty(self, prop, Reflect.getOwnPropertyDescriptor(meta, prop));
    }
    if (!shadow) return self;
    return Object.assign(Object.create(self), { [symbols.shadow]: shadow });
  }
  /**
   * Create a child context with an independent service scope for `name`.
   *
   * Below the returned context, reads and writes of the service `name`
   * resolve against the new label instead of the parent's, so a different
   * implementation can be provided without affecting the parent scope.
   * Passing the same `label` to two `isolate()` calls joins their scopes.
   *
   * @param name — the service name to isolate.
   * @param label — scope label to join; defaults to a fresh unique symbol.
   * @returns a child context whose `name` service resolves in the new scope.
   */
  isolate(name, label) {
    const shadow = Object.create(this[symbols.isolate]);
    shadow[name] = label ?? Symbol(name);
    return this.extend({ [symbols.isolate]: shadow });
  }
  intercept(name, config) {
    const intercept = Object.create(this[symbols.intercept]);
    intercept[name] = config;
    return this.extend({ [symbols.intercept]: intercept });
  }
};

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/vendor/cordis/src/service.ts
var Service = class _Service {
  /**
   * Register this instance as `name` in the current context.
   *
   * Calls `ctx.reflect.provide(name, this, this[Service.check])`, so the
   * service is unregistered automatically when the owning fiber unloads.
   * Services with a `[Service.invoke]` body return a callable instance.
   *
   * @param ctx — the context to register in (stored as `this.ctx`).
   * @param name — the service name; defaults to the static `provide` field.
   */
  constructor(ctx, name) {
    this.ctx = ctx;
    name ??= this.constructor["provide"];
    let self = this;
    const tracker = {
      associate: name,
      property: "ctx"
    };
    if (self[symbols.invoke]) {
      self = createCallable(name, joinPrototype(Object.getPrototypeOf(this), Function.prototype), tracker);
    }
    self.ctx = ctx;
    self.name = name;
    defineProperty(self, symbols.tracker, tracker);
    self.ctx.reflect.provide(name, self, this[symbols.check]);
    return self;
  }
  /** Symbol key of an instance method run after construction (class plugins). */
  static init = symbols.init;
  /** Symbol key of the availability predicate passed to `ctx.provide()`. */
  static check = symbols.check;
  /** Symbol key of the phantom intercept-config type parameter. */
  static config = symbols.config;
  /** Symbol key of the call body making a service callable (e.g. `ctx.logger()`). */
  static invoke = symbols.invoke;
  /** Symbol key of the helper deriving an extended service instance. */
  static extend = symbols.extend;
  /** Symbol key of the tracker metadata used for context tracing. */
  static tracker = symbols.tracker;
  /** Symbol key of the intercept-config resolution helper below. */
  static resolveConfig = symbols.resolveConfig;
  /** The service name this instance is registered under. */
  name;
  [symbols.filter](ctx) {
    return ctx[symbols.isolate][this.name] === this.ctx[symbols.isolate][this.name];
  }
  [symbols.extend](props) {
    let self;
    if (this[_Service.invoke]) {
      self = createCallable(this.name, this, this[symbols.tracker]);
    } else {
      self = Object.create(this);
    }
    return Object.assign(self, props);
  }
  /**
   * Merge intercept config from ancestors with optional base and head values.
   *
   * Entries added closer to the root apply first; `base` is prepended and
   * `head` appended. Uses `Config.merge` when the service declares one,
   * otherwise a shallow `Object.assign`.
   *
   * @param base — lowest-precedence config merged before all intercepts.
   * @param head — highest-precedence config merged after all intercepts.
   * @returns the merged config.
   */
  [symbols.resolveConfig](base, head) {
    let intercept = this.ctx[Context.intercept];
    const configs = [];
    while (this.name in intercept) {
      if (Object.hasOwn(intercept, this.name)) {
        configs.unshift(intercept[this.name]);
      }
      intercept = Object.getPrototypeOf(intercept);
    }
    if (base) configs.unshift(base);
    if (head) configs.push(head);
    if (this["Config"]?.merge) {
      return this["Config"].merge(...configs);
    } else {
      return Object.assign({}, ...configs);
    }
  }
  static [Symbol.hasInstance](instance) {
    if (!instance) return false;
    let constructor = instance.constructor;
    while (constructor) {
      constructor = constructor.prototype?.constructor;
      if (constructor === this) return true;
      constructor &&= Object.getPrototypeOf(constructor);
    }
    return false;
  }
};

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/typert/protocol/src/remote-error.ts
var RemoteError = class extends Error {
  /**
   * @param code - stable failure code declared in {@link RemoteErrorDetailsMap}.
   * @param message - human diagnostic carried across the wire.
   * @param details - structured payload typed by the code.
   * @param options - standard Error options (`cause` survives in-process only).
   */
  constructor(code, message, details, options) {
    super(message, options);
    this.code = code;
    this.details = details;
    this.name = "RemoteError";
  }
  /** Structural marker: cross-realm/bundle identification never uses instanceof. */
  isDSHRemoteError = true;
};

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/typert/protocol/src/owned-value.ts
var TYPERT_OWNED_VALUE = Symbol.for("dsh.typert.owned-value");

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/typert/protocol/src/index.ts
var TYPERT_REMOTE_SEGMENT_PATTERN = /^[A-Za-z0-9_$.-]+$/;
function isTypertRemoteSegment(value) {
  return value !== "." && value !== ".." && TYPERT_REMOTE_SEGMENT_PATTERN.test(value);
}
var REMOTE_METHOD_DESCRIPTOR = "@deepseek-ai/dsh-typert-protocol/remote-methods";
function bindTypertRemote(service, serviceKey, options = {}) {
  validateName("service key", serviceKey);
  const namespace = options.namespace ?? serviceKey;
  validateName("namespace", namespace);
  const ctx = Reflect.get(service, "ctx");
  if (Context.is(ctx)) provideInvocationAccessor(ctx);
  return Object.freeze({ service, serviceKey, namespace });
}
var TypertRemoteService = class extends Service {
  /** Visible binding consumed by the Gateway's source-mode discovery. */
  typertRemote;
  /**
   * Register the Service and bind the same key to Typert Gateway.
   * @param ctx - owning Cordis Context.
   * @param serviceKey - exact Cordis service key and default wire namespace.
   * @param options - optional wire namespace.
   */
  constructor(ctx, serviceKey, options = {}) {
    super(ctx, serviceKey);
    this.typertRemote = bindTypertRemote(this, this.name, options);
  }
};
function provideInvocationAccessor(ctx) {
  if (Object.hasOwn(ctx.root.reflect.props, "invocation")) return;
  ctx.root.accessor("invocation", { get: () => void 0 });
}
function Remote(methodExportOrOptions, context) {
  if (typeof methodExportOrOptions === "string") {
    validateName("Remote export name", methodExportOrOptions);
    return remoteDecorator({ kind: "direct" }, { exportName: methodExportOrOptions });
  }
  if (typeof methodExportOrOptions === "object") {
    return remoteDecorator({ kind: "direct" }, markerOptions(
      methodExportOrOptions,
      REMOTE_OPTION_KEYS,
      'Remote options require name, mode: "stream", or resources'
    ));
  }
  if (context === void 0) throw new TypeError("typert-protocol: Remote decorator context is missing");
  addMarkerInitializer(context, { kind: "direct" });
}
var REMOTE_OPTION_KEYS = /* @__PURE__ */ new Set(["name", "mode", "resources"]);
function markerOptions(options, accepted, requirement) {
  const keys = Reflect.ownKeys(options);
  if (keys.length === 0 || keys.some((key) => typeof key !== "string" || !accepted.has(key)) || Object.hasOwn(options, "mode") && options.mode !== "stream") {
    throw new TypeError(`typert-protocol: ${requirement}`);
  }
  const { mode, name, resources } = options;
  if (name !== void 0) validateName("Remote export name", name);
  return {
    ...mode === void 0 ? {} : { mode },
    ...name === void 0 ? {} : { exportName: name },
    ...resources === void 0 ? {} : { resources: resourceReaders(resources) }
  };
}
function resourceReaders(resources) {
  const readers = {};
  for (const [kind, reader] of Object.entries(resources)) {
    if (typeof reader !== "function") {
      throw new TypeError(`typert-protocol: Remote resource reader "${kind}" must be a function`);
    }
    readers[kind] = reader;
  }
  if (Object.keys(readers).length === 0) throw new TypeError("typert-protocol: Remote resources require at least one reader");
  return Object.freeze(readers);
}
function remoteDecorator(invocation, options = {}) {
  return function(_method, context) {
    addMarkerInitializer(context, invocation, options);
  };
}
function readRemoteMethodDescriptor(prototype) {
  const property2 = Object.getOwnPropertyDescriptor(prototype, REMOTE_METHOD_DESCRIPTOR);
  if (property2 === void 0) return void 0;
  const descriptor = property2.value;
  if (descriptor === null || typeof descriptor !== "object") {
    throw new TypeError("typert-protocol: Remote method descriptor must be an object");
  }
  const version2 = Reflect.get(descriptor, "version");
  if (version2 !== 1) {
    throw new TypeError(`typert-protocol: unsupported Remote method descriptor version ${String(version2)}`);
  }
  const methods = Reflect.get(descriptor, "methods");
  if (!Array.isArray(methods)) {
    throw new TypeError("typert-protocol: Remote method descriptor methods must be an array");
  }
  return descriptor;
}
function addMarkerInitializer(context, invocation, options = {}) {
  if (context.private || context.static || typeof context.name !== "string") {
    throw new TypeError("typert-protocol: Remote decorators require a public instance method with a string name");
  }
  const method = context.name;
  context.addInitializer(function() {
    const prototype = Object.getPrototypeOf(this);
    if (prototype === null) {
      throw new TypeError(`typert-protocol: cannot mark Remote method "${method}" on an object without a prototype`);
    }
    mark(prototype, method, invocation, options);
  });
}
function mark(prototype, method, invocation, { mode, exportName, resources }) {
  const descriptor = readRemoteMethodDescriptor(prototype);
  const marker = Object.freeze({
    method,
    ...exportName === void 0 || exportName === method ? {} : { exportName },
    ...mode === void 0 ? {} : { mode },
    invocation: Object.freeze(invocation),
    ...resources === void 0 ? {} : { resources }
  });
  const current = descriptor?.methods.find((candidate) => candidate.method === method);
  if (current !== void 0) {
    if (current.exportName === marker.exportName && current.mode === marker.mode && current.resources === marker.resources && sameInvocation(current.invocation, invocation)) return;
    throw new Error(`typert-protocol: Remote method "${method}" has conflicting invocation markers`);
  }
  Object.defineProperty(prototype, REMOTE_METHOD_DESCRIPTOR, {
    configurable: true,
    value: Object.freeze({
      version: 1,
      methods: Object.freeze([...descriptor?.methods ?? [], marker])
    })
  });
}
function sameInvocation(left, right) {
  if (left.kind === "direct") return right.kind === "direct";
  if (right.kind === "direct") return false;
  return left.context === right.context;
}
function validateName(subject, value) {
  if (!isTypertRemoteSegment(value)) {
    throw new TypeError(`typert-protocol: ${subject} must contain only RPC endpoint segment characters`);
  }
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/util/values/src/partial-json.ts
var SIMPLE_ESCAPES = {
  '"': '"',
  "\\": "\\",
  "/": "/",
  b: "\b",
  f: "\f",
  n: "\n",
  r: "\r",
  t: "	"
};
var CONTENT_ESCAPE = /[\\\u0000-\u001f]/u;
function isWhitespace(c) {
  return c === " " || c === "\n" || c === "\r" || c === "	";
}
function isHex(c) {
  return c >= "0" && c <= "9" || c >= "a" && c <= "f" || c >= "A" && c <= "F";
}
var PartialArguments = class _PartialArguments {
  /** The view of a call with no arguments available. */
  static EMPTY = _PartialArguments.fromObject({});
  /**
   * View finished argument text without scanning it until a reader asks.
   * @param text - the complete argument JSON text.
   * @returns a sealed view.
   */
  static fromText(text) {
    const view = new _PartialArguments();
    view.append(text);
    view.sealed = true;
    return view;
  }
  /**
   * View an already parsed argument payload, such as a PTC dispatch object.
   * @param value - the parsed argument value.
   * @returns a sealed view; a non-object payload has no fields.
   */
  static fromObject(value) {
    const view = new _PartialArguments();
    view.object = typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
    view.sealed = true;
    return view;
  }
  /**
   * The source: text so far or a parsed object, plus whether it can still grow.
   * These are the only enumerable fields, so two views over the same source
   * compare equal structurally however far each has been read.
   */
  chunks = [];
  object;
  sealed = false;
  // Scan progress, located fields, and remembered reads are caches over the source.
  #ends = [];
  #size = 0;
  #consumed = 0;
  #mode = "root";
  #escape = false;
  #keyStart = 0;
  #keyEscaped = false;
  #key = "";
  #current = null;
  #nestedEnds = [];
  #nestedInString = false;
  #invalidAt;
  #invalidValue = false;
  #entries = /* @__PURE__ */ new Map();
  #order = [];
  #reads = /* @__PURE__ */ new Map();
  /** Whether this view rejects further appends; does not scan text or register reads. */
  get isSealed() {
    return this.sealed;
  }
  /** Whether indexing or a content read found invalid JSON; unread value contents are not validated. */
  get invalid() {
    this.scan();
    return this.#mode === "invalid" || this.#invalidValue;
  }
  /**
   * Retain streamed argument text without scanning or comparing observed answers.
   * @param fragment - the text following every fragment appended before.
   */
  append(fragment) {
    if (this.sealed) throw new Error("PartialArguments: cannot append to a sealed view");
    if (fragment.length === 0) return;
    this.chunks.push(fragment);
    this.#size += fragment.length;
    this.#ends.push(this.#size);
  }
  /**
   * Reconcile a streamed prefix with authoritative complete text without joining the fragments.
   * @param text - the final argument text, which replaces missing or conflicting deltas.
   * @returns this view sealed with its caches retained when every character matches; otherwise a new sealed view.
   */
  settle(text) {
    if (this.object !== void 0 || text.length !== this.#size) return _PartialArguments.fromText(text);
    let offset = 0;
    for (const chunk of this.chunks) {
      if (!text.startsWith(chunk, offset)) return _PartialArguments.fromText(text);
      offset += chunk.length;
    }
    this.chunks = text.length === 0 ? [] : [text];
    this.#ends = text.length === 0 ? [] : [text.length];
    this.sealed = true;
    return this;
  }
  /**
   * Compare observed answers and advance their publication baseline. Unread views remain unscanned.
   * @returns whether any observed answer changed since its first read or the preceding refresh.
   */
  refresh() {
    if (this.#reads.size === 0) return false;
    this.scan();
    let changed = false;
    let completions = false;
    for (const read of this.#reads.values()) {
      if (read.completion) {
        completions = true;
        continue;
      }
      changed = this.refreshRead(read) || changed;
    }
    if (completions) {
      for (const read of this.#reads.values()) if (read.completion) changed = this.refreshRead(read) || changed;
    }
    if (this.sealed) this.#reads.clear();
    return changed;
  }
  refreshRead(read) {
    const now = read.answer();
    if (Object.is(now, read.last)) return false;
    read.last = now;
    return true;
  }
  /**
   * Check whether no further fields can arrive.
   * @returns whether the outer object closed, indexing failed, or the view is sealed; unread values are not validated.
   */
  closed() {
    return this.remember("closed", "", () => this.closedNow());
  }
  /**
   * List discovered fields in first-appearance order.
   * @returns top-level keys seen so far, in first-appearance order.
   */
  keys() {
    return this.remember("keys", "", () => this.keysNow(), (keys) => keys.length);
  }
  /**
   * Check whether a top-level field has appeared.
   * @param key - argument name.
   * @returns whether the field has appeared (a string opened or another value began).
   */
  has(key) {
    return this.remember("has", key, () => this.hasNow(key));
  }
  /**
   * Check whether a field's closing delimiter has arrived, without validating its contents.
   * @param key - argument name.
   * @returns whether its delimiter arrived and no content reader has reported an error for this value.
   */
  complete(key) {
    return this.remember("complete", key, () => this.completeNow(key));
  }
  /**
   * Read string length without materializing its text.
   * @param key - argument name.
   * @param options - change granularity for a streaming string.
   * @returns decoded UTF-16 length of the string field so far; undefined when absent or not a string.
   */
  stringLength(key, options) {
    const step = Math.max(1, Math.floor(options?.step ?? 1));
    const offset = options?.offset ?? 0;
    return this.remember(
      `length:${step}:${offset}`,
      key,
      () => this.lengthNow(key),
      (length) => length === void 0 ? void 0 : Math.ceil((length + offset) / step)
    );
  }
  /**
   * Check a string against a decoded UTF-16 length limit without materializing it.
   * @param key - argument name.
   * @param maxLength - decoded UTF-16 limit, floored to at least zero.
   * @returns whether the string is longer than the limit; false when absent or not a string.
   */
  stringExceeds(key, maxLength) {
    const limit = Math.max(0, Math.floor(maxLength));
    return this.remember(
      `exceeds:${limit}`,
      key,
      () => (this.lengthNow(key, limit + 1) ?? 0) > limit
    );
  }
  /**
   * Read a decoded string, including a streaming prefix.
   * @param key - argument name.
   * @returns the string field's decoded text so far; undefined when absent or not a string.
   */
  text(key) {
    return this.remember("text", key, () => this.textNow(key));
  }
  /**
   * Read at most the first decoded UTF-16 units of a string.
   * @param key - argument name.
   * @param maxLength - maximum decoded UTF-16 length, floored to at least one.
   * @returns the bounded string prefix; undefined when absent or not a string.
   */
  textPrefix(key, maxLength) {
    const limit = Math.max(1, Math.floor(maxLength));
    return this.remember(
      `prefix:${limit}`,
      key,
      () => this.textPrefixNow(key, limit)
    );
  }
  /**
   * Read a completed non-string argument.
   * @param key - argument name.
   * @returns the parsed non-string value once it closed; undefined while open, absent, or a string.
   */
  value(key) {
    return this.remember("value", key, () => this.valueNow(key));
  }
  /** Answer a question and, on a streaming view, remember it for change detection. */
  remember(kind, key, read, comparison) {
    this.scan();
    const result = read();
    if (!this.sealed) {
      const id = `${kind}/${key}`;
      if (!this.#reads.has(id)) {
        this.#reads.set(id, {
          completion: kind === "complete",
          answer: comparison === void 0 ? read : () => comparison(read()),
          last: comparison === void 0 ? result : comparison(result)
        });
      }
    }
    return result;
  }
  closedNow() {
    return this.sealed || this.#mode === "closed" || this.#mode === "invalid";
  }
  keysNow() {
    return this.object === void 0 ? this.#order : Object.keys(this.object);
  }
  hasNow(key) {
    return this.object === void 0 ? this.#entries.has(key) : Object.hasOwn(this.object, key);
  }
  completeNow(key) {
    if (this.object !== void 0) return Object.hasOwn(this.object, key);
    const entry = this.#entries.get(key);
    return entry !== void 0 && entry.end >= 0 && (entry.kind === "string" ? entry.invalidAt === void 0 : !entry.invalid);
  }
  lengthNow(key, limit = Number.POSITIVE_INFINITY) {
    if (this.object !== void 0) {
      const field = Object.hasOwn(this.object, key) ? this.object[key] : void 0;
      return typeof field === "string" ? field.length : void 0;
    }
    const entry = this.#entries.get(key);
    if (entry?.kind !== "string") return void 0;
    if (entry.text !== void 0 && entry.text.at === entry.end) return entry.text.length;
    const read = entry.length ??= { at: entry.start, length: 0, text: "" };
    this.readString(entry, read, limit, false);
    return read.length;
  }
  textNow(key) {
    if (this.object !== void 0) {
      const field = Object.hasOwn(this.object, key) ? this.object[key] : void 0;
      return typeof field === "string" ? field : void 0;
    }
    const entry = this.#entries.get(key);
    if (entry?.kind !== "string") return void 0;
    if (entry.text === void 0 && entry.end >= 0 && entry.needsDecoding && entry.invalidAt === void 0) {
      let text;
      try {
        text = JSON.parse(`"${this.slice(entry.start, entry.end)}"`);
      } catch (_error) {
      }
      if (text !== void 0) entry.text = { at: entry.end, length: text.length, text };
    }
    const read = entry.text ??= { at: entry.start, length: 0, text: "" };
    this.readString(entry, read, Number.POSITIVE_INFINITY, true);
    return read.text;
  }
  textPrefixNow(key, maxLength) {
    if (this.object !== void 0) {
      const field = Object.hasOwn(this.object, key) ? this.object[key] : void 0;
      return typeof field === "string" ? field.slice(0, maxLength) : void 0;
    }
    const entry = this.#entries.get(key);
    if (entry?.kind !== "string") return void 0;
    const prefixes = entry.prefixes ??= /* @__PURE__ */ new Map();
    let read = prefixes.get(maxLength);
    if (read === void 0) {
      read = { at: entry.start, length: 0, text: "" };
      prefixes.set(maxLength, read);
    }
    this.readString(entry, read, maxLength, true);
    return read.text;
  }
  valueNow(key) {
    if (this.object !== void 0) {
      if (!Object.hasOwn(this.object, key)) return void 0;
      const field = this.object[key];
      return typeof field === "string" ? void 0 : field;
    }
    const entry = this.#entries.get(key);
    if (entry?.kind !== "value" || entry.end < 0 || entry.invalid) return void 0;
    if (entry.parsed === void 0) {
      try {
        entry.parsed = JSON.parse(this.slice(entry.start, entry.end));
      } catch (_error) {
        entry.invalid = true;
        this.#invalidValue = true;
      }
    }
    return entry.parsed;
  }
  chunkAt(at) {
    let low = 0;
    let high = this.#ends.length;
    while (low < high) {
      const mid = low + high >>> 1;
      if (this.#ends[mid] <= at) low = mid + 1;
      else high = mid;
    }
    return low;
  }
  /** Materialize only a requested range, never the cumulative source. */
  slice(start, end) {
    if (start >= end) return "";
    const first = this.chunkAt(start);
    const last = this.chunkAt(end - 1);
    const base = first === 0 ? 0 : this.#ends[first - 1];
    if (first === last) return this.chunks[first].slice(start - base, end - base);
    const parts = [this.chunks[first].slice(start - base)];
    for (let i = first + 1; i < last; i++) parts.push(this.chunks[i]);
    parts.push(this.chunks[last].slice(0, end - this.#ends[last - 1]));
    return parts.join("");
  }
  readString(entry, read, limit, materialize) {
    const end = Math.min(
      entry.end < 0 ? this.#consumed : entry.end,
      entry.invalidAt ?? Number.POSITIVE_INFINITY,
      this.#invalidAt ?? Number.POSITIVE_INFINITY
    );
    if (!entry.needsDecoding) {
      const length = Math.min(end - read.at, limit - read.length);
      if (length <= 0) return;
      if (materialize) read.text += this.slice(read.at, read.at + length);
      read.at += length;
      read.length += length;
      return;
    }
    let chunkIndex = this.chunkAt(read.at);
    while (read.at < end && read.length < limit) {
      const base = chunkIndex === 0 ? 0 : this.#ends[chunkIndex - 1];
      const chunk = this.chunks[chunkIndex];
      const remaining = chunk.slice(read.at - base, Math.min(chunk.length, end - base));
      const boundary = remaining.search(CONTENT_ESCAPE);
      const length = Math.min(boundary < 0 ? remaining.length : boundary, limit - read.length);
      if (length > 0) {
        if (materialize) read.text += remaining.slice(0, length);
        read.at += length;
        read.length += length;
        if (read.at === base + chunk.length) chunkIndex++;
        continue;
      }
      const type = remaining.length > 1 ? remaining[1] : read.at + 1 < end ? this.chunks[chunkIndex + 1][0] : void 0;
      let decoded;
      let width = 2;
      if (remaining[0] === "\\" && type === void 0 && entry.end < 0) return;
      if (remaining[0] === "\\" && type === "u") {
        const hex = this.slice(read.at + 2, Math.min(end, read.at + 6));
        let valid = true;
        for (let i = 0; i < hex.length; i++) if (!isHex(hex[i])) valid = false;
        if (valid) {
          if (hex.length < 4 && entry.end < 0) return;
          if (hex.length === 4) decoded = String.fromCharCode(Number.parseInt(hex, 16));
        }
        width = 6;
      } else if (remaining[0] === "\\" && type !== void 0) {
        decoded = SIMPLE_ESCAPES[type];
      }
      if (decoded === void 0) {
        entry.invalidAt = read.at;
        this.#invalidValue = true;
        return;
      }
      if (materialize) read.text += decoded;
      read.length++;
      read.at += width;
      while (chunkIndex < this.chunks.length && read.at >= this.#ends[chunkIndex]) chunkIndex++;
    }
  }
  /** Locate new field ranges without decoding or parsing their contents. */
  scan() {
    if (this.object !== void 0 || this.#consumed === this.#size) return;
    for (let i = this.chunkAt(this.#consumed); i < this.chunks.length && this.#invalidAt === void 0; i++) {
      const pending = this.chunks[i];
      const base = i === 0 ? 0 : this.#ends[i - 1];
      for (let index = this.#consumed - base; index < pending.length && this.#mode !== "invalid"; index++) {
        if (this.#mode === "string" || this.#mode === "nested" && this.#nestedInString) {
          const end = this.stringBoundary(pending, index);
          this.#consumed += end - index;
          index = end;
          if (index === pending.length) break;
        }
        this.step(pending[index], this.#consumed);
        this.#consumed++;
      }
    }
  }
  /** Only raw quotes and their preceding backslash runs can terminate a string. */
  stringBoundary(fragment, start) {
    let at = start;
    while (true) {
      const quote = fragment.indexOf('"', at);
      const end = quote < 0 ? fragment.length : quote;
      if (this.#mode === "string") {
        const entry = this.#current;
        if (!entry.needsDecoding && CONTENT_ESCAPE.test(fragment.slice(at, end))) entry.needsDecoding = true;
      }
      let slashStart = end;
      while (slashStart > at && fragment[slashStart - 1] === "\\") slashStart--;
      const escaped = (end - slashStart) % 2 === 1 !== (slashStart === at && this.#escape);
      this.#escape = quote < 0 && escaped;
      if (quote < 0 || !escaped) return end;
      at = quote + 1;
    }
  }
  step(c, at) {
    switch (this.#mode) {
      case "root":
        if (isWhitespace(c)) return;
        if (c === "{") {
          this.#mode = "key-or-end";
          return;
        }
        this.fail();
        return;
      case "key-or-end":
        if (isWhitespace(c)) return;
        if (c === "}") {
          this.#mode = "closed";
          return;
        }
        if (c === '"') {
          this.beginKey(at);
          return;
        }
        this.fail();
        return;
      case "key-only":
        if (isWhitespace(c)) return;
        if (c === '"') {
          this.beginKey(at);
          return;
        }
        this.fail();
        return;
      case "key":
        this.stepKey(c, at);
        return;
      case "colon":
        if (isWhitespace(c)) return;
        if (c === ":") {
          this.#mode = "value";
          return;
        }
        this.fail();
        return;
      case "value":
        this.beginValue(c, at);
        return;
      case "string": {
        const entry = this.#current;
        entry.end = at;
        this.#current = null;
        this.#mode = "comma-or-end";
        return;
      }
      case "scalar":
        this.stepScalar(c, at);
        return;
      case "nested":
        this.stepNested(c, at);
        return;
      case "comma-or-end":
        if (isWhitespace(c)) return;
        if (c === ",") {
          this.#mode = "key-only";
          return;
        }
        if (c === "}") {
          this.#mode = "closed";
          return;
        }
        this.fail();
        return;
      case "closed":
        if (isWhitespace(c)) return;
        this.fail();
        return;
      /* v8 ignore next 2 -- scan() stops stepping once the view is invalid. */
      case "invalid":
        return;
      /* v8 ignore next 2 -- Every scanner mode has a handler above. */
      default:
        assertNever(this.#mode);
    }
  }
  fail() {
    this.#invalidAt = this.#consumed;
    this.#mode = "invalid";
    this.#current = null;
  }
  beginKey(at) {
    this.#mode = "key";
    this.#keyStart = at + 1;
    this.#keyEscaped = false;
    this.#escape = false;
  }
  stepKey(c, at) {
    if (c < " ") {
      this.fail();
      return;
    }
    if (this.#escape) {
      this.#escape = false;
      return;
    }
    if (c === "\\") {
      this.#escape = true;
      this.#keyEscaped = true;
      return;
    }
    if (c !== '"') return;
    const raw = this.slice(this.#keyStart, at);
    if (this.#keyEscaped) {
      try {
        this.#key = JSON.parse(`"${raw}"`);
      } catch (_error) {
        this.fail();
        return;
      }
    } else {
      this.#key = raw;
    }
    this.#mode = "colon";
  }
  open(entry) {
    if (!this.#entries.has(this.#key)) this.#order.push(this.#key);
    this.#entries.set(this.#key, entry);
    this.#current = entry;
  }
  beginValue(c, at) {
    if (isWhitespace(c)) return;
    if (c === '"') {
      this.open({
        kind: "string",
        start: at + 1,
        end: -1,
        needsDecoding: false,
        invalidAt: void 0,
        length: void 0,
        text: void 0,
        prefixes: void 0
      });
      this.#escape = false;
      this.#mode = "string";
      return;
    }
    if (c === "}" || c === "," || c === ":" || c === "]") {
      this.fail();
      return;
    }
    this.open({ kind: "value", start: at, end: -1, parsed: void 0, invalid: false });
    if (c === "{" || c === "[") {
      this.#mode = "nested";
      this.#nestedEnds = [c === "{" ? "}" : "]"];
      this.#nestedInString = false;
      this.#escape = false;
      return;
    }
    this.#mode = "scalar";
  }
  stepScalar(c, at) {
    if (c !== "," && c !== "}" && !isWhitespace(c)) return;
    this.closeValue(at);
    this.#mode = c === "," ? "key-only" : c === "}" ? "closed" : "comma-or-end";
  }
  stepNested(c, at) {
    if (this.#nestedInString) {
      this.#nestedInString = false;
      return;
    }
    if (c === '"') {
      this.#nestedInString = true;
      return;
    }
    if (c === "{" || c === "[") {
      this.#nestedEnds.push(c === "{" ? "}" : "]");
      return;
    }
    if (c === "}" || c === "]") {
      if (this.#nestedEnds.pop() !== c) {
        this.fail();
        return;
      }
      if (this.#nestedEnds.length === 0) {
        this.closeValue(at + 1);
        this.#mode = "comma-or-end";
      }
    }
  }
  closeValue(end) {
    const entry = this.#current;
    entry.end = end;
    this.#current = null;
  }
};

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/util/values/src/index.ts
function assertNever(value, context) {
  const rendered = JSON.stringify(value) ?? String(value);
  throw new Error(`unreachable variant${context ? ` in ${context}` : ""}: ${rendered}`);
}
function deepFreeze(value) {
  const seen = /* @__PURE__ */ new WeakSet();
  const pending = [{ kind: "visit", node: value }];
  while (pending.length > 0) {
    const task = pending.pop();
    if (task === void 0) continue;
    if (task.kind === "property") {
      pending.push({ kind: "visit", node: task.source[task.key] });
      continue;
    }
    const node = task.node;
    if (node === null || typeof node !== "object") continue;
    if (node instanceof AbortSignal) continue;
    if (seen.has(node)) continue;
    seen.add(node);
    Object.freeze(node);
    const keys = Object.keys(node);
    for (let index = keys.length - 1; index >= 0; index--) {
      const key = keys[index];
      if (key === void 0) continue;
      pending.push({ kind: "property", source: node, key });
    }
  }
  return value;
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/util/brand/src/index.ts
function brandString(value) {
  return value;
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm/src/message.ts
function freezeMessage(message) {
  return deepFreeze(structuredClone(message));
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/vendor/schemastery/src/index.ts
var kSchema = Symbol.for("schemastery");
var kValidationError2 = Symbol.for("ValidationError");
globalThis.__schemastery_index__ ??= 0;
globalThis.__schemastery_refs__ = void 0;
var ValidationError2 = class extends TypeError {
  constructor(message, options) {
    let prefix = "$";
    for (const segment of options.path || []) {
      if (typeof segment === "string") {
        prefix += "." + segment;
      } else if (typeof segment === "number") {
        prefix += "[" + segment + "]";
      } else if (typeof segment === "symbol") {
        prefix += `[Symbol(${segment.toString()})]`;
      }
    }
    if (prefix.startsWith(".")) prefix = prefix.slice(1);
    super((prefix === "$" ? "" : `${prefix} `) + message);
    this.options = options;
  }
  name = "ValidationError";
  static is(error) {
    return !!error?.[kValidationError2];
  }
};
Object.defineProperty(ValidationError2.prototype, kValidationError2, {
  value: true
});
var Schema = function(options) {
  const schema = function(data, options2 = {}) {
    return Schema.resolve(data, schema, options2)[0];
  };
  if (options.refs) {
    const refs = mapValues(options.refs, (options2) => new Schema(options2));
    const getRef = (uid) => refs[uid];
    for (const key in refs) {
      const options2 = refs[key];
      options2.sKey = getRef(options2.sKey);
      options2.inner = getRef(options2.inner);
      options2.list = options2.list && options2.list.map(getRef);
      options2.dict = options2.dict && mapValues(options2.dict, getRef);
    }
    return refs[options.uid];
  }
  Object.assign(schema, options);
  if (typeof schema.callback === "string") {
    try {
      schema.callback = new Function("return " + schema.callback)();
    } catch {
    }
  }
  Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
  Object.setPrototypeOf(schema, Schema.prototype);
  schema.meta ||= {};
  schema.toString = schema.toString.bind(schema);
  return schema;
};
Schema.prototype = Object.create(Function.prototype);
Schema.prototype[kSchema] = true;
Object.defineProperty(Schema.prototype, "~standard", {
  get() {
    return {
      version: 1,
      vendor: "schemastery",
      validate: (value) => {
        try {
          return { value: Schema.resolve(value, this, {})[0] };
        } catch (error) {
          if (ValidationError2.is(error)) {
            return { issues: [{ message: error.message, path: error.options.path }] };
          }
          throw error;
        }
      }
    };
  }
});
Schema.ValidationError = ValidationError2;
Schema.prototype.toJSON = function toJSON() {
  if (globalThis.__schemastery_refs__) {
    globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
    return this.uid;
  }
  globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
  globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
  const result = { uid: this.uid, refs: globalThis.__schemastery_refs__ };
  globalThis.__schemastery_refs__ = void 0;
  return result;
};
Schema.prototype.set = function set(key, value) {
  this.dict[key] = value;
  return this;
};
Schema.prototype.push = function push(value) {
  this.list.push(value);
  return this;
};
function mergeDesc(original, messages) {
  const result = typeof original === "string" ? { "": original } : { ...original };
  for (const locale in messages) {
    const value = messages[locale];
    if (value?.$description || value?.$desc) {
      result[locale] = value.$description || value.$desc;
    } else if (typeof value === "string") {
      result[locale] = value;
    }
  }
  return result;
}
function getInner(value) {
  return value?.$value ?? value?.$inner;
}
function extractKeys(data) {
  return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
}
Schema.prototype.i18n = function i18n(messages) {
  const schema = Schema(this);
  const desc = mergeDesc(schema.meta.description, messages);
  if (Object.keys(desc).length) schema.meta.description = desc;
  if (schema.dict) {
    schema.dict = mapValues(schema.dict, (inner, key) => {
      return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
    });
  }
  if (schema.list) {
    schema.list = schema.list.map((inner, index) => {
      return inner.i18n(mapValues(messages, (data = {}) => {
        if (Array.isArray(getInner(data))) return getInner(data)[index];
        if (Array.isArray(data)) return data[index];
        return extractKeys(data);
      }));
    });
  }
  if (schema.inner) {
    schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
      if (getInner(data)) return getInner(data);
      return extractKeys(data);
    }));
  }
  if (schema.sKey) {
    schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
  }
  return schema;
};
Schema.prototype.extra = function extra(key, value) {
  const schema = Schema(this);
  schema.meta = { ...schema.meta, [key]: value };
  return schema;
};
for (const key of ["required", "disabled", "collapse", "hidden", "loose"]) {
  Object.assign(Schema.prototype, {
    [key](value = true) {
      const schema = Schema(this);
      schema.meta = { ...schema.meta, [key]: value };
      return schema;
    }
  });
}
Schema.prototype.deprecated = function deprecated() {
  const schema = Schema(this);
  schema.meta.badges ||= [];
  schema.meta.badges.push({ text: "deprecated", type: "danger" });
  return schema;
};
Schema.prototype.experimental = function experimental() {
  const schema = Schema(this);
  schema.meta.badges ||= [];
  schema.meta.badges.push({ text: "experimental", type: "warning" });
  return schema;
};
Schema.prototype.pattern = function pattern(regexp) {
  const schema = Schema(this);
  const pattern2 = pick(regexp, ["source", "flags"]);
  schema.meta = { ...schema.meta, pattern: pattern2 };
  return schema;
};
Schema.prototype.simplify = function simplify(value) {
  if (isVolatile(value)) value = value.get();
  if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
  if (isNullable(value)) return value;
  if (this.type === "object" || this.type === "dict") {
    const result = {};
    for (const key in value) {
      const schema = this.type === "object" ? this.dict[key] : this.inner;
      const item = schema?.simplify(value[key]);
      if (this.type === "dict" || !isNullable(item)) result[key] = item;
    }
    if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
    return result;
  } else if (this.type === "array" || this.type === "tuple") {
    const result = [];
    value.forEach((value2, index) => {
      const schema = this.type === "array" ? this.inner : this.list[index];
      const item = schema ? schema.simplify(value2) : value2;
      result.push(item);
    });
    return result;
  } else if (this.type === "intersect") {
    const result = {};
    for (const item of this.list) {
      Object.assign(result, item.simplify(value));
    }
    return result;
  } else if (this.type === "union") {
    for (const schema of this.list) {
      try {
        Schema.resolve(value, schema, {});
        return schema.simplify(value);
      } catch {
      }
    }
  }
  return value;
};
Schema.prototype.toString = function toString(inline) {
  return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
};
Schema.prototype.role = function role(role, extra2) {
  const schema = Schema(this);
  schema.meta = { ...schema.meta, role, extra: extra2 };
  return schema;
};
for (const key of ["default", "link", "comment", "description", "max", "min", "step"]) {
  Object.assign(Schema.prototype, {
    [key](value) {
      const schema = Schema(this);
      schema.meta = { ...schema.meta, [key]: value };
      return schema;
    }
  });
}
Schema.prototype.volatile = function volatile() {
  if (this.meta.volatile) throw new TypeError("volatile schema is already wrapped");
  return this.extra("volatile", true);
};
var resolvers = {};
var checkedVolatile = Symbol("checked-volatile-schema");
function validateVolatileSchema(schema, path = [], blocked = false, seen = /* @__PURE__ */ new Map()) {
  const states = seen.get(schema) ?? /* @__PURE__ */ new Set();
  if (states.has(blocked)) return;
  states.add(blocked);
  seen.set(schema, states);
  if (schema.meta?.volatile && blocked) {
    throw new ValidationError2("volatile fields require a fixed object path without an enclosing volatile field", { path });
  }
  const nested = blocked || !!schema.meta?.volatile;
  if (schema.dict) {
    for (const [key, child] of Object.entries(schema.dict)) validateVolatileSchema(child, [...path, key], nested, seen);
  }
  if (schema.sKey) validateVolatileSchema(schema.sKey, [...path, "<key>"], true, seen);
  if (schema.inner && (schema.type !== "lazy" || schema.inner[kSchema])) {
    validateVolatileSchema(schema.inner, [...path, "*"], true, seen);
  }
  if (schema.list) {
    for (let index = 0; index < schema.list.length; index++) {
      validateVolatileSchema(schema.list[index], [...path, String(index)], true, seen);
    }
  }
}
Schema.extend = function extend(type, resolve3) {
  resolvers[type] = resolve3;
};
Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
  if (!schema) return [data];
  if (!options[checkedVolatile]) {
    validateVolatileSchema(schema, options.path);
    options = { ...options, [checkedVolatile]: true };
  }
  if (schema.meta?.volatile) {
    const inner = Schema(schema);
    inner.meta = { ...schema.meta, volatile: false };
    const [value, adapted] = Schema.resolve(data, inner, options, strict);
    try {
      return [createVolatile(value), adapted];
    } catch (error) {
      throw new ValidationError2(error instanceof Error ? error.message : String(error), options);
    }
  }
  if (options.ignore?.(data, schema)) return [data];
  if (isNullable(data) && schema.type !== "lazy") {
    if (schema.meta.required) throw new ValidationError2(`missing required value`, options);
    let current = schema;
    let fallback = schema.meta.default;
    while (current?.type === "intersect" && isNullable(fallback)) {
      current = current.list[0];
      fallback = current?.meta.default;
    }
    if (isNullable(fallback)) return [data];
    data = clone(fallback);
  }
  const callback = resolvers[schema.type];
  if (!callback) throw new ValidationError2(`unsupported type "${schema.type}"`, options);
  try {
    return callback(data, schema, options, strict);
  } catch (error) {
    if (!schema.meta.loose) throw error;
    return [schema.meta.default];
  }
};
Schema.from = function from(source) {
  if (isNullable(source)) {
    return Schema.any();
  } else if (["string", "number", "boolean"].includes(typeof source)) {
    return Schema.const(source).required();
  } else if (source[kSchema]) {
    return source;
  } else if (typeof source === "function") {
    switch (source) {
      case String:
        return Schema.string().required();
      case Number:
        return Schema.number().required();
      case Boolean:
        return Schema.boolean().required();
      case Function:
        return Schema.function().required();
      default:
        return Schema.is(source).required();
    }
  } else {
    throw new TypeError(`cannot infer schema from ${source}`);
  }
};
Schema.lazy = function lazy(builder) {
  const toJSON2 = () => {
    if (!schema.inner[kSchema]) {
      schema.inner = schema.builder();
      schema.inner.meta = { ...schema.meta, ...schema.inner.meta };
    }
    return schema.inner.toJSON();
  };
  const schema = new Schema({ type: "lazy", builder, inner: { toJSON: toJSON2 } });
  return schema;
};
Schema.natural = function natural() {
  return Schema.number().step(1).min(0);
};
Schema.percent = function percent() {
  return Schema.number().step(0.01).min(0).max(1).role("slider");
};
Schema.date = function date() {
  return Schema.union([
    Schema.is(Date),
    Schema.transform(Schema.string().role("datetime"), (value, options) => {
      const date2 = new Date(value);
      if (isNaN(+date2)) throw new ValidationError2(`invalid date "${value}"`, options);
      return date2;
    }, true)
  ]);
};
Schema.regExp = function regExp(flag = "") {
  return Schema.union([
    Schema.is(RegExp),
    Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
      try {
        return new RegExp(value, flag);
      } catch (e) {
        throw new ValidationError2(e.message, options);
      }
    }, true)
  ]);
};
Schema.arrayBuffer = function arrayBuffer(encoding) {
  return Schema.union([
    Schema.is(ArrayBuffer),
    Schema.is(SharedArrayBuffer),
    Schema.transform(Schema.any(), (value, options) => {
      if (Binary.isSource(value)) return Binary.fromSource(value);
      throw new ValidationError2(`expected ArrayBufferSource but got ${value}`, options);
    }, true),
    ...encoding ? [Schema.transform(Schema.string(), (value, options) => {
      try {
        return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
      } catch (e) {
        throw new ValidationError2(e.message, options);
      }
    }, true)] : []
  ]);
};
Schema.extend("lazy", (data, schema, options, strict) => {
  if (!schema.inner[kSchema]) {
    schema.inner = schema.builder();
    schema.inner.meta = { ...schema.meta, ...schema.inner.meta };
    validateVolatileSchema(schema.inner, options.path, true);
  }
  return Schema.resolve(data, schema.inner, options, strict);
});
Schema.extend("any", (data) => {
  return [data];
});
Schema.extend("never", (data, _, options) => {
  throw new ValidationError2(`expected nullable but got ${data}`, options);
});
Schema.extend("const", (data, { value }, options) => {
  if (deepEqual(data, value)) return [value];
  throw new ValidationError2(`expected ${value} but got ${data}`, options);
});
function checkWithinRange(data, meta, description, options, skipMin = false) {
  const { max = Infinity, min = -Infinity } = meta;
  if (data > max) throw new ValidationError2(`expected ${description} <= ${max} but got ${data}`, options);
  if (data < min && !skipMin) throw new ValidationError2(`expected ${description} >= ${min} but got ${data}`, options);
}
Schema.extend("string", (data, { meta }, options) => {
  if (typeof data !== "string") throw new ValidationError2(`expected string but got ${data}`, options);
  if (meta.pattern) {
    const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
    if (!regexp.test(data)) throw new ValidationError2(`expect string to match regexp ${regexp}`, options);
  }
  checkWithinRange(data.length, meta, "string length", options);
  return [data];
});
function decimalShift(data, digits) {
  const str = data.toString();
  if (str.includes("e")) return data * Math.pow(10, digits);
  const index = str.indexOf(".");
  if (index === -1) return data * Math.pow(10, digits);
  const frac = str.slice(index + 1);
  const integer = str.slice(0, index);
  if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
  return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
}
function isMultipleOf(data, min, step) {
  step = Math.abs(step);
  if (!/^\d+\.\d+$/.test(step.toString())) {
    return (data - min) % step === 0;
  }
  const index = step.toString().indexOf(".");
  const digits = step.toString().slice(index + 1).length;
  return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
}
Schema.extend("number", (data, { meta }, options) => {
  if (typeof data !== "number") throw new ValidationError2(`expected number but got ${data}`, options);
  checkWithinRange(data, meta, "number", options);
  const { step } = meta;
  if (step && !isMultipleOf(data, meta.min ?? 0, step)) {
    throw new ValidationError2(`expected number multiple of ${step} but got ${data}`, options);
  }
  return [data];
});
Schema.extend("boolean", (data, _, options) => {
  if (typeof data === "boolean") return [data];
  throw new ValidationError2(`expected boolean but got ${data}`, options);
});
Schema.extend("bitset", (data, { bits, meta }, options) => {
  let value = 0, keys = [];
  if (typeof data === "number") {
    value = data;
    for (const key in bits) {
      if (data & bits[key]) {
        keys.push(key);
      }
    }
  } else if (Array.isArray(data)) {
    keys = data;
    for (const key of keys) {
      if (typeof key !== "string") throw new ValidationError2(`expected string but got ${key}`, options);
      if (key in bits) value |= bits[key];
    }
  } else {
    throw new ValidationError2(`expected number or array but got ${data}`, options);
  }
  if (value === meta.default) return [value];
  return [value, keys];
});
Schema.extend("function", (data, _, options) => {
  if (typeof data === "function") return [data];
  throw new ValidationError2(`expected function but got ${data}`, options);
});
Schema.extend("is", (data, { constructor }, options) => {
  if (typeof constructor === "function") {
    if (data instanceof constructor) return [data];
    throw new ValidationError2(`expected ${constructor.name} but got ${data}`, options);
  } else {
    if (isNullable(data)) {
      throw new ValidationError2(`expected ${constructor} but got ${data}`, options);
    }
    let prototype = Object.getPrototypeOf(data);
    while (prototype) {
      if (prototype.constructor?.name === constructor) return [data];
      prototype = Object.getPrototypeOf(prototype);
    }
    throw new ValidationError2(`expected ${constructor} but got ${data}`, options);
  }
});
function property(data, key, schema, options) {
  try {
    const [value, adapted] = Schema.resolve(data[key], schema, {
      ...options,
      path: [...options.path || [], key]
    });
    if (adapted !== void 0) data[key] = adapted;
    return value;
  } catch (e) {
    if (!options?.autofix) throw e;
    delete data[key];
    return schema.meta.volatile ? createVolatile(schema.meta.default) : schema.meta.default;
  }
}
Schema.extend("array", (data, { inner, meta }, options) => {
  if (!Array.isArray(data)) throw new ValidationError2(`expected array but got ${data}`, options);
  checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
  return [data.map((_, index) => property(data, index, inner, options))];
});
Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
  if (!isPlainObject(data)) throw new ValidationError2(`expected object but got ${data}`, options);
  const result = {};
  for (const key in data) {
    let rKey;
    try {
      rKey = Schema.resolve(key, sKey, options)[0];
    } catch (error) {
      if (strict) continue;
      throw error;
    }
    result[rKey] = property(data, key, inner, options);
    data[rKey] = data[key];
    if (key !== rKey) delete data[key];
  }
  return [result];
});
Schema.extend("tuple", (data, { list }, options, strict) => {
  if (!Array.isArray(data)) throw new ValidationError2(`expected array but got ${data}`, options);
  const result = list.map((inner, index) => property(data, index, inner, options));
  if (strict) return [result];
  result.push(...data.slice(list.length));
  return [result];
});
function merge(result, data) {
  for (const key in data) {
    if (key in result) continue;
    result[key] = data[key];
  }
}
Schema.extend("object", (data, { dict }, options, strict) => {
  if (!isPlainObject(data)) throw new ValidationError2(`expected object but got ${data}`, options);
  const result = {};
  for (const key in dict) {
    const value = property(data, key, dict[key], options);
    if (!isNullable(value) || key in data) {
      result[key] = value;
    }
  }
  if (!strict) merge(result, data);
  return [result];
});
Schema.extend("union", (data, { list, toString: toString2 }, options, strict) => {
  const messages = [];
  for (const inner of list) {
    try {
      return Schema.resolve(data, inner, options, strict);
    } catch (error) {
      messages.push(error);
    }
  }
  throw new ValidationError2(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
});
Schema.extend("intersect", (data, { list, toString: toString2 }, options, strict) => {
  if (!list.length) return [data];
  let result;
  for (const inner of list) {
    const value = Schema.resolve(data, inner, options, true)[0];
    if (isNullable(value)) continue;
    if (isNullable(result)) {
      result = value;
    } else if (typeof result !== typeof value) {
      throw new ValidationError2(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
    } else if (typeof value === "object") {
      merge(result ??= {}, value);
    } else if (result !== value) {
      throw new ValidationError2(`expected ${toString2()} but got ${JSON.stringify(data)}`, options);
    }
  }
  if (!strict && isPlainObject(data)) merge(result, data);
  return [result];
});
Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
  const [result, adapted = data] = Schema.resolve(data, inner, options, true);
  if (preserve) {
    return [callback(result)];
  } else {
    return [callback(result), callback(adapted)];
  }
});
var formatters = {};
function defineMethod(name, keys, format) {
  formatters[name] = format;
  Object.assign(Schema, {
    [name](...args) {
      const schema = new Schema({ type: name });
      keys.forEach((key, index) => {
        switch (key) {
          case "sKey":
            schema.sKey = args[index] ?? Schema.string();
            break;
          case "inner":
            schema.inner = Schema.from(args[index]);
            break;
          case "list":
            schema.list = args[index].map(Schema.from);
            break;
          case "dict":
            schema.dict = mapValues(args[index], Schema.from);
            break;
          case "bits": {
            schema.bits = {};
            for (const key2 in args[index]) {
              if (typeof args[index][key2] !== "number") continue;
              schema.bits[key2] = args[index][key2];
            }
            break;
          }
          case "callback": {
            const callback = schema.callback = args[index];
            callback["toJSON"] ||= () => callback.toString();
            break;
          }
          case "constructor": {
            const constructor = schema.constructor = args[index];
            if (typeof constructor === "function") {
              ;
              constructor["toJSON"] ||= () => constructor["name"];
            }
            break;
          }
          default:
            schema[key] = args[index];
        }
      });
      if (name === "object" || name === "dict") {
        schema.meta.default = {};
      } else if (name === "array" || name === "tuple") {
        schema.meta.default = [];
      } else if (name === "bitset") {
        schema.meta.default = 0;
      }
      return schema;
    }
  });
}
defineMethod("is", ["constructor"], ({ constructor }) => {
  if (typeof constructor === "function") {
    return constructor.name;
  } else {
    return constructor;
  }
});
defineMethod("any", [], () => "any");
defineMethod("never", [], () => "never");
defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
defineMethod("string", [], () => "string");
defineMethod("number", [], () => "number");
defineMethod("boolean", [], () => "boolean");
defineMethod("bitset", ["bits"], () => "bitset");
defineMethod("function", [], () => "function");
defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
defineMethod("object", ["dict"], ({ dict }) => {
  if (Object.keys(dict).length === 0) return "{}";
  return `{ ${Object.entries(dict).map(([key, inner]) => {
    return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
  }).join(", ")} }`;
});
defineMethod("union", ["list"], ({ list }, inline) => {
  const result = list.map(({ toString: format }) => format()).join(" | ");
  return inline ? `(${result})` : result;
});
defineMethod("intersect", ["list"], ({ list }) => {
  return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
});
defineMethod("transform", ["inner", "callback", "preserve"], ({ inner }, isInner) => inner.toString(isInner));
var src_default = Schema;

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/util/timeout/src/index.ts
var TimeoutReason = class extends Error {
  /**
   * @param code Capability-owned timeout code (e.g. `BASH_TIMEOUT`).
   * @param timeoutMs The deadline that elapsed, in milliseconds.
   */
  constructor(code, timeoutMs) {
    super(`${code} after ${timeoutMs}ms`);
    this.code = code;
    this.timeoutMs = timeoutMs;
  }
  name = "TimeoutReason";
};
var MAX_TIMER_DELAY_MS = 2147483647;
function assertTimerDelay(timeoutMs, name) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > MAX_TIMER_DELAY_MS) {
    throw new Error(`${name} must be a positive finite number no greater than ${MAX_TIMER_DELAY_MS}`);
  }
}
function deadline(upstream, timeoutMs, code) {
  if (timeoutMs <= 0) {
    return { signal: upstream ?? new AbortController().signal, [Symbol.dispose]() {
    } };
  }
  assertTimerDelay(timeoutMs, "deadline timeoutMs");
  const timer = new AbortController();
  const id = setTimeout(() => {
    timer.abort(new TimeoutReason(code, timeoutMs));
  }, timeoutMs);
  return {
    // AbortSignal.any adopts the reason of whichever source aborts FIRST, so a
    // race resolves to a single cause: timeoutOf() reads TimeoutReason only
    // when the timeout won, and upstream-wins leaves an ordinary abort reason.
    signal: upstream !== void 0 ? AbortSignal.any([upstream, timer.signal]) : timer.signal,
    [Symbol.dispose]() {
      clearTimeout(id);
    }
  };
}
function idleWatchdog(upstream, timeoutMs, code) {
  assertTimerDelay(timeoutMs, "idleWatchdog timeoutMs");
  const timeout = new AbortController();
  const signal = upstream === void 0 ? timeout.signal : AbortSignal.any([upstream, timeout.signal]);
  const reason = new TimeoutReason(code, timeoutMs);
  let timer;
  let outstanding = false;
  let disposed = false;
  const arm = () => {
    if (timer !== void 0) clearTimeout(timer);
    timer = setTimeout(() => {
      timeout.abort(reason);
    }, timeoutMs);
  };
  return {
    signal,
    async next(iterator) {
      if (disposed) throw new Error("idleWatchdog is disposed");
      if (outstanding) throw new Error("idleWatchdog next is already outstanding");
      outstanding = true;
      arm();
      const expired = Promise.withResolvers();
      const onAbort = () => {
        expired.reject(reason);
      };
      timeout.signal.addEventListener("abort", onAbort, { once: true });
      try {
        return await Promise.race([
          iterator.next().finally(() => {
            timeout.signal.removeEventListener("abort", onAbort);
          }),
          expired.promise
        ]);
      } finally {
        clearTimeout(timer);
        timer = void 0;
        outstanding = false;
      }
    },
    pulse() {
      if (disposed || !outstanding) return;
      arm();
    },
    [Symbol.dispose]() {
      if (disposed) return;
      disposed = true;
      if (timer !== void 0) clearTimeout(timer);
      timer = void 0;
    }
  };
}
function timeoutOf(x, code) {
  const reason = x.reason;
  if (!(reason instanceof TimeoutReason)) return void 0;
  return code === void 0 || reason.code === code ? reason : void 0;
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/util/error/src/index.ts
var HarnessError = class extends Error {
  /** Stable machine-routable failure class (e.g. `RATE_LIMIT`); route on this, never by parsing `message`. */
  code;
  constructor(message, code, options) {
    super(message, options);
    this.code = code;
    this.name = new.target.name;
  }
};

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm/src/error.ts
var LLM_FAILURE_CODES = {
  ABORTED: {},
  ACCOUNT_QUOTA: {},
  ACCOUNT_SIGN_IN_REQUIRED: {},
  ACCOUNT_TOKEN_INVALID: {},
  AUTH: {},
  CLIENT_UPGRADE_REQUIRED: {},
  CONTEXT_WINDOW_EXCEEDED: {},
  DISCOVERY_FAILED: {},
  DISCOVERY_UNSUPPORTED: {},
  DUPLICATE_ADAPTER: {},
  DUPLICATE_DIRECTORY: {},
  DUPLICATE_DISCOVERY: {},
  EMPTY_RESPONSE: { retryChoice: true },
  FILES_API: {},
  IMAGE_OFFLOAD_REQUIRED: {},
  INVALID_ADAPTER: {},
  INVALID_CATALOG: {},
  INVALID_CONFIG: {},
  INVALID_CREDENTIAL: {},
  INVALID_DIRECTORY: {},
  INVALID_DISCOVERY: {},
  INVALID_MODEL_CONTEXT: {},
  INVALID_MODEL_INFO: {},
  INVALID_MODEL_MAX_TOKENS: {},
  INVALID_MODEL_REASONING: {},
  INVALID_PREPARED_CALL: {},
  INVALID_REPLAY_STATE: {},
  INVALID_REQUEST: {},
  INVALID_RESPONSE: {},
  MALFORMED_RESPONSE: { retryChoice: true },
  MISSING_CREDENTIAL: {},
  MODEL_SWITCH_COMPACTION_FAILED: {},
  MODEL_UNSUPPORTED: {},
  NO_ADAPTER: {},
  NO_CREDENTIAL_STORE: {},
  NO_DISCOVERY: {},
  PI_AI_ERROR: {},
  QUOTA: { retryChoice: true },
  RATE_LIMIT: { retryChoice: true },
  REGISTRATION_DISPOSED: {},
  REQUEST_EXTENSION: {},
  REQUEST_HEADERS: {},
  SERVER: { retryChoice: true },
  STREAM_CLOSED: { retryChoice: true },
  TIMEOUT: { retryChoice: true },
  TRANSPORT: { retryChoice: true },
  UNKNOWN: {},
  UNKNOWN_MODEL: {},
  UNSTORABLE_PROVIDER_ID: {},
  UNSUPPORTED_CONTENT: {},
  UNSUPPORTED_OPTION: {},
  UNSUPPORTED_REASONING_EFFORT: {}
};
var RETRY_CODE_CHOICES = Object.freeze(
  Object.keys(LLM_FAILURE_CODES).filter((code) => "retryChoice" in LLM_FAILURE_CODES[code])
);
var EMPTY_RESPONSE_CODE = "EMPTY_RESPONSE";
var STRUCTURED_CONTEXT_OVERFLOW = new RegExp(
  String.raw`(?:^|[^a-z0-9])context[\s_-](?:length|window)[\s_-]` + String.raw`(?:exceed(?:ed|s)?|overflow(?:ed)?|limit[\s_-]exceeded)(?:$|[^a-z0-9])`,
  "i"
);
var TOO_LARGE_FOR_CONTEXT = new RegExp(
  String.raw`\b(?:request|prompt|input|messages?)\s+(?:is\s+|are\s+)?` + String.raw`too\s+(?:large|long)\s+for\s+(?:(?:this|the)\s+)?` + String.raw`(?:model(?:'s)?\s+)?context(?:\s+window)?\b`,
  "i"
);
var EXCEEDS_MODEL_CONTEXT = new RegExp(
  String.raw`\b(?:input|prompt|request|messages?)\b.{0,40}` + String.raw`\b(?:exceed(?:s|ed)?|overflows?|is\s+larger\s+than)\b.{0,40}` + String.raw`\b(?:the\s+)?(?:model(?:'s)?\s+)?context(?:\s+(?:length|window))?\b`,
  "i"
);
function isContextWindowExceededError(detail) {
  return STRUCTURED_CONTEXT_OVERFLOW.test(detail) || /\b(?:maximum|max)(?:\s+(?:allowed|supported))?\s+context\s+(?:length|window)\b/i.test(detail) || TOO_LARGE_FOR_CONTEXT.test(detail) || /\b(?:input|prompt|request)\s+(?:is\s+)?too\s+(?:long|large)\s+for\s+(?:this|the)\s+model\b/i.test(detail) || EXCEEDS_MODEL_CONTEXT.test(detail);
}
function isQuotaExceededError(detail) {
  return /\binsufficient[\s_-]+(?:quota|balance|credits?)\b/i.test(detail) || /\b(?:quota|usage[\s_-]+limit)[\s_-]+(?:exceeded|exhausted|reached)\b/i.test(detail) || /\bexceed(?:ed|s)?[\s_-]+(?:(?:your|the)[\s_-]+)?(?:current[\s_-]+)?quota\b/i.test(detail) || /\b(?:balance|credits?)[\s_-]+(?:exhausted|depleted)\b/i.test(detail) || /\bout[\s_-]+of[\s_-]+(?:credits?|budget)\b/i.test(detail);
}
function errorChain(value) {
  const path = /* @__PURE__ */ new Set();
  const render = (current) => {
    if (path.has(current)) return "<circular cause>";
    path.add(current);
    try {
      if (!(current instanceof Error)) {
        if (typeof current === "object" && current !== null) {
          const descriptor = Object.getOwnPropertyDescriptor(current, "message");
          if (descriptor !== void 0 && "value" in descriptor && typeof descriptor.value === "string") {
            return descriptor.value;
          }
        }
        return String(current);
      }
      const message = current.message === "" ? current.name : current.message;
      const members = current instanceof AggregateError && current.errors.length > 0 ? ` [${current.errors.map(render).join("; ")}]` : "";
      const causeText = current.cause === void 0 || current.cause === null ? "" : render(current.cause);
      const cause = causeText === "" || causeText === message ? "" : `: ${causeText}`;
      return `${message}${members}${cause}`;
    } catch {
      return "<unrenderable value>";
    } finally {
      path.delete(current);
    }
  };
  return render(value);
}
var IMAGE_OFFLOAD_REQUIRED_CODE = "IMAGE_OFFLOAD_REQUIRED";

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm/src/retry-policy.ts
var DEFAULT_MAX_RETRIES = 5;
var DEFAULT_INITIAL_DELAY_MS = 500;
var DEFAULT_MAX_DELAY_MS = 1e4;
var DEFAULT_JITTER_RATIO = 0.1;
var DEFAULT_RETRYABLE_CODES = Object.freeze([
  EMPTY_RESPONSE_CODE,
  "RATE_LIMIT",
  "SERVER",
  "TIMEOUT",
  "TRANSPORT"
]);
var backoffSchema = src_default.object({
  initialDelayMs: src_default.number().min(Number.MIN_VALUE).max(MAX_TIMER_DELAY_MS).default(DEFAULT_INITIAL_DELAY_MS),
  maxDelayMs: src_default.number().min(Number.MIN_VALUE).max(MAX_TIMER_DELAY_MS).default(DEFAULT_MAX_DELAY_MS),
  jitterRatio: src_default.number().min(0).max(1).default(DEFAULT_JITTER_RATIO)
});
var normalPolicySchema = src_default.object({
  mode: src_default.const("normal").required(),
  maxRetries: src_default.number().step(1).min(0).max(Number.MAX_SAFE_INTEGER).default(DEFAULT_MAX_RETRIES),
  // The constant branches publish the built-in choices to settings forms; the
  // string branch admits codes that other providers raise.
  retryableCodes: src_default.array(src_default.union([...RETRY_CODE_CHOICES.map((code) => src_default.const(code)), src_default.string().min(1)])).min(1).default([...DEFAULT_RETRYABLE_CODES]),
  backoff: backoffSchema
});
var alwaysPolicySchema = src_default.object({
  mode: src_default.const("always").required(),
  backoff: backoffSchema
});
var RetryPolicySchema = src_default.union([
  normalPolicySchema,
  alwaysPolicySchema
]);
var NORMAL_POLICY_KEYS = /* @__PURE__ */ new Set([
  "mode",
  "maxRetries",
  "retryableCodes",
  "backoff"
]);
var ALWAYS_POLICY_KEYS = /* @__PURE__ */ new Set([
  "mode",
  "maxRetries",
  "retryableCodes",
  "backoff"
]);
var BACKOFF_KEYS = /* @__PURE__ */ new Set(["initialDelayMs", "maxDelayMs", "jitterRatio"]);
function validateKeys(value, allowed, path) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new Error(`${path}: unknown key "${key}"`);
  }
}
function resolveBackoff(config, path) {
  if (config !== void 0) validateKeys(config, BACKOFF_KEYS, path);
  const initialDelayMs = config?.initialDelayMs ?? DEFAULT_INITIAL_DELAY_MS;
  const maxDelayMs = config?.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
  const jitterRatio = config?.jitterRatio ?? DEFAULT_JITTER_RATIO;
  if (!Number.isFinite(initialDelayMs) || initialDelayMs <= 0 || initialDelayMs > MAX_TIMER_DELAY_MS) {
    throw new Error(`${path}.initialDelayMs must be a positive finite number no greater than ${MAX_TIMER_DELAY_MS}`);
  }
  if (!Number.isFinite(maxDelayMs) || maxDelayMs <= 0 || maxDelayMs > MAX_TIMER_DELAY_MS) {
    throw new Error(`${path}.maxDelayMs must be a positive finite number no greater than ${MAX_TIMER_DELAY_MS}`);
  }
  if (initialDelayMs > maxDelayMs) {
    throw new Error(`${path}.initialDelayMs must be less than or equal to maxDelayMs`);
  }
  if (!Number.isFinite(jitterRatio) || jitterRatio < 0 || jitterRatio > 1) {
    throw new Error(`${path}.jitterRatio must be between 0 and 1`);
  }
  return Object.freeze({ initialDelayMs, maxDelayMs, jitterRatio });
}
function resolveRetryPolicy(config, path) {
  if (config === void 0) {
    return Object.freeze({
      mode: "normal",
      maxRetries: DEFAULT_MAX_RETRIES,
      retryableCodes: DEFAULT_RETRYABLE_CODES,
      ...resolveBackoff(void 0, `${path}.backoff`)
    });
  }
  switch (config.mode) {
    case "normal": {
      validateKeys(config, NORMAL_POLICY_KEYS, path);
      const maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
      const retryableCodes = config.retryableCodes ?? [...DEFAULT_RETRYABLE_CODES];
      if (!Number.isSafeInteger(maxRetries) || maxRetries < 0) {
        throw new Error(`${path}.maxRetries must be a non-negative safe integer`);
      }
      if (retryableCodes.length === 0) {
        throw new Error(`${path}.retryableCodes must not be empty`);
      }
      if (retryableCodes.some((code) => typeof code !== "string" || code.length === 0)) {
        throw new Error(`${path}.retryableCodes must contain only non-empty strings`);
      }
      if (new Set(retryableCodes).size !== retryableCodes.length) {
        throw new Error(`${path}.retryableCodes must not contain duplicates`);
      }
      return Object.freeze({
        mode: "normal",
        maxRetries,
        retryableCodes: Object.freeze([...retryableCodes]),
        ...resolveBackoff(config.backoff, `${path}.backoff`)
      });
    }
    case "always":
      validateKeys(config, ALWAYS_POLICY_KEYS, path);
      return Object.freeze({
        mode: "always",
        ...resolveBackoff(config.backoff, `${path}.backoff`)
      });
    default:
      throw new Error(`${path}.mode must be "normal" or "always"`);
  }
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm/src/call-config.ts
function callConfigEquals(a, b) {
  if (a.provider !== b.provider || a.model !== b.model || a.reasoningEffort !== b.reasoningEffort || a.temperature !== b.temperature || a.maxTokens !== b.maxTokens) return false;
  if (a.stop === void 0 || b.stop === void 0) return a.stop === b.stop;
  return a.stop.length === b.stop.length && a.stop.every((s, i) => s === b.stop?.[i]);
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm/src/adapter-failure.ts
function normalizeLlmFailure(value) {
  const error = value instanceof Error ? value : new HarnessError(thrownMessage(value), "UNKNOWN", { cause: value });
  const carried = ownFailureSnapshot(error);
  if (carried !== void 0 && carried.code === ownErrorCode(error)) return carried;
  return Object.freeze({
    message: errorMessage(error),
    code: harnessErrorCode(error)
  });
}
function thrownMessage(value) {
  try {
    const message = String(value);
    return message.length > 0 ? message : "LLM adapter failed";
  } catch (_hostileThrownValue) {
    return "LLM adapter failed";
  }
}
function ownErrorCode(error) {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(error, "code");
    return descriptor !== void 0 && "value" in descriptor ? descriptor.value : void 0;
  } catch (_sdkPropertyTrap) {
    return void 0;
  }
}
function ownFailureSnapshot(error) {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(error, "failure");
    return descriptor !== void 0 && "value" in descriptor ? failureSnapshot(descriptor.value) : void 0;
  } catch (_sdkPropertyTrap) {
    return void 0;
  }
}
function failureSnapshot(value) {
  if (typeof value !== "object" || value === null) return void 0;
  try {
    const candidate = value;
    const message = candidate.message;
    const code = candidate.code;
    const status = candidate.status;
    const providerRetryAfterMs = candidate.providerRetryAfterMs;
    const requestId = candidate.requestId;
    const offloadImages = candidate.offloadImages;
    if (typeof message !== "string" || message.length === 0 || typeof code !== "string" || code.length === 0 || status !== void 0 && (!Number.isInteger(status) || status < 100 || status > 599) || providerRetryAfterMs !== void 0 && (!Number.isFinite(providerRetryAfterMs) || providerRetryAfterMs <= 0) || requestId !== void 0 && (typeof requestId !== "string" || requestId.length === 0) || offloadImages !== void 0 && (!Number.isSafeInteger(offloadImages) || offloadImages <= 0)) return void 0;
    return Object.freeze({
      message,
      code,
      ...status === void 0 ? {} : { status },
      ...providerRetryAfterMs === void 0 ? {} : { providerRetryAfterMs },
      ...requestId === void 0 ? {} : { requestId },
      ...offloadImages === void 0 ? {} : { offloadImages }
    });
  } catch (_sdkFailureGetter) {
    return void 0;
  }
}
function errorMessage(error) {
  try {
    const message = error.message;
    if (typeof message === "string" && message.length > 0) return message;
  } catch (_sdkMessageGetter) {
  }
  return "LLM adapter failed";
}
function harnessErrorCode(error) {
  return error instanceof HarnessError ? error.code : "UNKNOWN";
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm/src/content.ts
function resolveImageAttachmentAccess(attachments, mapHostPath, ref) {
  const hostPath = attachments.imageHostPath(ref);
  if (hostPath === void 0) return void 0;
  const readonlyPath = mapHostPath(hostPath);
  return readonlyPath === void 0 ? void 0 : { readonlyPath };
}
function quoted(value) {
  return JSON.stringify(value);
}
function imageIdentity(ref) {
  return ref.name === void 0 ? String(ref.attachmentId) : `${quoted(ref.name)} (${ref.attachmentId})`;
}
function extension(mediaType) {
  switch (mediaType) {
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpg";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return assertNever(mediaType, "image extension");
  }
}
function normalizedAccessText(ref, access) {
  return ` Normalized copy (read-only; may be resized or re-encoded): ${quoted(access.readonlyPath)} (${ref.width}x${ref.height}px, ${ref.mediaType}). Source dimensions, format, and byte size may differ. Copy to a writable path ending in ${extension(ref.mediaType)} before editing.`;
}
function textOnlyImageText(ref) {
  const digest = String(ref.attachmentId).slice("sha256:".length, "sha256:".length + 8);
  return `[image omitted because this model accepts text only; attachment sha256:${digest}]`;
}
function requestImageHandleText(ref, version2, access) {
  const preview = `Image ${imageIdentity(ref)}; request preview ${version2.width}x${version2.height}px.`;
  return access === void 0 ? `${preview} It may be resized or re-encoded; source dimensions, format, and byte size may differ.` : preview + normalizedAccessText(ref, access);
}
function offloadedImageText(ref, access) {
  const identity = `image omitted to fit request image limits; ${imageIdentity(ref)}.`;
  if (access === void 0) {
    return `[${identity} No local normalized image path is available; ask the user to attach it again if needed.]`;
  }
  return `[${identity}${normalizedAccessText(ref, access)}]`;
}
function contentHasImage(content) {
  return content.some((block) => block.type === "image");
}
function contentHasFile(content) {
  for (const block of content) {
    if (block.type === "file") return true;
  }
  return false;
}
function fileHandleText(ref, readonlyPath) {
  const digest = String(ref.attachmentId).slice("sha256:".length, "sha256:".length + 8);
  const identity = `File ${quoted(ref.name)} (${ref.bytes} bytes, sha256:${digest})`;
  if (readonlyPath === void 0) {
    return `[${identity} was uploaded, but the current execution environment cannot access a readable path. Report that limitation if its contents are needed; do not claim to have read it.]`;
  }
  return `[${identity}: verbatim read-only copy saved at ${quoted(readonlyPath)}. Read that path with your file tools when its contents are needed; copy it to a writable location before modifying it. When delegating file work, include this saved path in the delegation prompt; only subagents sharing this execution environment can read it.]`;
}
function replaceFilesWithHandles(blocks, resolvePath) {
  let next;
  for (const [index, block] of blocks.entries()) {
    if (block.type === "file") {
      next ??= blocks.slice(0, index);
      next.push({ type: "text", text: fileHandleText(block.attachment, resolvePath(block.attachment)) });
      continue;
    }
    next?.push(block);
  }
  return next ?? blocks;
}
function projectFilesToText(messages, resolvePath) {
  if (!messages.some((message) => contentHasFile(message.content))) return messages;
  return messages.map((message) => {
    const content = replaceFilesWithHandles(message.content, resolvePath);
    return content === message.content ? message : { ...message, content };
  });
}
function base64Length(bytes) {
  return Math.ceil(bytes / 3) * 4;
}
function visitImageBlocks(content, visit) {
  for (const block of content) {
    if (block.type === "image") visit(block);
  }
}
function replaceOffloadedImages(blocks, placeholder) {
  let next;
  for (const [index, block] of blocks.entries()) {
    if (block.type === "image" && block.offloaded === true) {
      next ??= blocks.slice(0, index);
      next.push({ type: "text", text: placeholder(block.attachment) });
      continue;
    }
    next?.push(block);
  }
  return next ?? blocks;
}
function projectOffloadedImages(messages, placeholder) {
  return messages.map((message) => {
    const content = replaceOffloadedImages(message.content, placeholder);
    return content === message.content ? message : { ...message, content };
  });
}
function offloadedImagePrefixCount(lengths, budget) {
  const total = lengths.reduce((sum, bytes) => sum + bytes, 0);
  const excessCount = budget.maxImages === void 0 ? 0 : Math.max(0, lengths.length - budget.maxImages);
  const excessBytes = budget.maxBytes === void 0 ? 0 : Math.max(0, total - budget.maxBytes);
  if (excessCount === 0 && excessBytes === 0) return 0;
  const countQuantum = budget.countQuantum ?? 1;
  const byteQuantum = budget.byteQuantum ?? 1;
  const removeCount = excessCount === 0 ? 0 : Math.ceil(excessCount / countQuantum) * countQuantum;
  const removeBytes = excessBytes === 0 ? 0 : Math.ceil(excessBytes / byteQuantum) * byteQuantum;
  let count = 0;
  let removedBytes = 0;
  for (const imageBytes of lengths) {
    const byteTargetMet = removeBytes === 0 || (byteQuantum === 1 ? removedBytes >= removeBytes : removedBytes > removeBytes);
    if (count >= removeCount && byteTargetMet) break;
    removedBytes += imageBytes;
    count += 1;
  }
  return count;
}
function requiredImageOffload(messages, budget, versionBytes) {
  const lengths = [];
  for (const message of messages) {
    visitImageBlocks(message.content, (block) => {
      if (block.offloaded === true) return;
      const bytes = versionBytes(block);
      lengths.push(budget.representation === "base64" ? base64Length(bytes) : bytes);
    });
  }
  return offloadedImagePrefixCount(lengths, budget);
}
function replaceImagesForTextModel(blocks) {
  let next;
  for (const [index, block] of blocks.entries()) {
    if (block.type === "image") {
      next ??= blocks.slice(0, index);
      next.push({ type: "text", text: textOnlyImageText(block.attachment) });
      continue;
    }
    next?.push(block);
  }
  return next ?? blocks;
}
function projectImagesForTextModel(messages) {
  if (!messages.some((message) => contentHasImage(message.content))) return messages;
  return messages.map((message) => {
    const content = replaceImagesForTextModel(message.content);
    return content === message.content ? message : { ...message, content };
  });
}
function withoutDeveloperMessages(messages) {
  const retained = messages.filter((message) => message.role !== "developer");
  return retained.length === messages.length ? messages : retained;
}
function toolDeclarations(history) {
  const declarations = new Map(history.tools.map((tool) => [tool.name, tool]));
  for (const update of history.updates) {
    for (const tool of update.additions) {
      if (!declarations.has(tool.name)) {
        declarations.set(tool.name, { ...tool, deferLoading: true });
      }
    }
  }
  return declarations;
}
function rebaseAdditionOnlyHistory(history, messages) {
  const available = new Map(history.tools.map((tool) => [tool.name, tool]));
  let baseline = history.tools;
  let retainedFrom = 0;
  for (const [index, update] of history.updates.entries()) {
    const additions = new Map(update.additions.map((tool) => [tool.name, tool]));
    let reset = available.size === 0 && additions.size > 0;
    for (const block of messages.get(update.messageId)) {
      if (block.type === "tool-addition") {
        const { deferLoading: _loading, ...tool } = additions.get(block.toolName);
        available.set(tool.name, tool);
      } else if (block.type === "tool-removal") {
        reset = true;
        available.delete(block.toolName);
      }
    }
    if (reset) {
      baseline = [...available.values()];
      retainedFrom = index + 1;
    }
  }
  return retainedFrom === 0 ? history : { tools: baseline, updates: history.updates.slice(retainedFrom) };
}
function projectToolUpdates(messages, tools, toolUpdate, history) {
  if (toolUpdate === void 0) {
    let immediateTools = tools;
    if (tools?.some((tool) => tool.deferLoading === true)) {
      immediateTools = tools.map(({ deferLoading: _loading, ...tool }) => tool);
    }
    return { messages: withoutDeveloperMessages(messages), tools: immediateTools };
  }
  if (history === void 0) {
    return { messages: withoutDeveloperMessages(messages), tools };
  }
  const updates = new Map(messages.flatMap((message) => message.role === "developer" ? [[message.id, message.content]] : []));
  if (history.updates.some((update) => !updates.has(update.messageId))) {
    return { messages: withoutDeveloperMessages(messages), tools };
  }
  const projectedHistory = toolUpdate === "addition-only" ? rebaseAdditionOnlyHistory(history, updates) : history;
  const declarations = toolDeclarations(projectedHistory);
  const updateIds = new Set(history.updates.map((update) => update.messageId));
  const retainedUpdateIds = new Set(projectedHistory.updates.map((update) => update.messageId));
  const offered = new Set(projectedHistory.tools.filter((tool) => !tool.deferLoading).map((tool) => tool.name));
  const projectedMessages = [];
  for (const message of messages) {
    if (message.role !== "developer") {
      projectedMessages.push(message);
      continue;
    }
    if (!updateIds.has(message.id)) continue;
    const content = message.content.filter((block) => {
      switch (block.type) {
        case "tool-addition":
          if (!retainedUpdateIds.has(message.id)) return false;
          if (!declarations.has(block.toolName) || offered.has(block.toolName)) return false;
          offered.add(block.toolName);
          return true;
        case "tool-removal":
          if (toolUpdate !== "in-history") return false;
          return offered.delete(block.toolName);
        default:
          return true;
      }
    });
    if (content.length === 0) continue;
    if (content.length === message.content.length) {
      projectedMessages.push(message);
    } else {
      projectedMessages.push({ ...message, content });
    }
  }
  const unchanged = projectedMessages.length === messages.length && projectedMessages.every((message, index) => message === messages[index]);
  return {
    messages: unchanged ? messages : projectedMessages,
    tools: [...declarations.values()]
  };
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm/src/attribution.ts
import { createRequire } from "node:module";
var { version } = createRequire(import.meta.url)("../package.json");
var PRODUCT = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+(?:\/[!#$%&'*+.^_`|~0-9A-Za-z-]+)?$/;
function launchSuffix() {
  const value = process.env.DSH_USER_AGENT_SUFFIX;
  if (value === void 0 || value === "") return void 0;
  if (!PRODUCT.test(value)) throw new Error(`DSH_USER_AGENT_SUFFIX must be an RFC 9110 product token; got ${JSON.stringify(value)}`);
  return value;
}
var APP_IDENTITY = {
  product: "deepseek-harness",
  version,
  url: "https://github.com/deepseek-ai/deepseek-harness",
  get suffix() {
    return launchSuffix();
  }
};
function userAgent(identity = APP_IDENTITY) {
  const base = `${identity.product}/${identity.version} (+${identity.url})`;
  return identity.suffix === void 0 ? base : `${base} ${identity.suffix}`;
}
function attributionHeaders(identity = APP_IDENTITY) {
  return { "user-agent": userAgent(identity) };
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm/src/brand.ts
function ToolCallId(id) {
  return brandString(id);
}
function ProviderRequestId(id) {
  return brandString(id);
}
function ReasoningEffortId(id) {
  return brandString(id);
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm/src/index.ts
var LlmError = class _LlmError extends HarnessError {
  /** Serializable facts retained beside this live Error. */
  failure;
  /**
   * @param message - non-empty human-readable failure summary.
   * @param code - built-in stable provider-neutral machine code.
   * @param options - optional cause and validated serializable provider facts.
   */
  constructor(message, code, options) {
    if (typeof message !== "string" || message.length === 0) throw new Error("LlmError message must be a non-empty string");
    if (typeof code !== "string" || code.length === 0) throw new Error("LlmError code must be a non-empty string");
    if (options?.status !== void 0 && (!Number.isInteger(options.status) || options.status < 100 || options.status > 599)) {
      throw new Error("LlmError status must be an integer from 100 through 599");
    }
    if (options?.providerRetryAfterMs !== void 0 && (!Number.isFinite(options.providerRetryAfterMs) || options.providerRetryAfterMs <= 0)) {
      throw new Error("LlmError providerRetryAfterMs must be a positive finite number");
    }
    if (options?.requestId !== void 0 && (typeof options.requestId !== "string" || options.requestId.length === 0)) {
      throw new Error("LlmError requestId must be a non-empty string");
    }
    super(message, code, options);
    this.name = "LlmError";
    this.failure = Object.freeze({
      message,
      code,
      ...options?.status === void 0 ? {} : { status: options.status },
      ...options?.providerRetryAfterMs === void 0 ? {} : { providerRetryAfterMs: options.providerRetryAfterMs },
      ...options?.requestId === void 0 ? {} : { requestId: options.requestId },
      ...options?.offloadImages === void 0 ? {} : { offloadImages: options.offloadImages }
    });
  }
  /**
   * Raise an observed failure again with its own code, which any provider may have chosen.
   * @param failure - the serializable failure, typically from a stream's terminal chunk.
   * @param options - optional cause.
   * @returns an error carrying the failure's message, code, and provider facts.
   */
  static fromFailure(failure, options) {
    return new _LlmError(failure.message, failure.code, { ...failure, ...options });
  }
};
var LlmAdapter = class {
  /**
   * Describe one provider route owned by this adapter.
   * @param provider - a route passed to `registerAdapter()` for this instance.
   * @returns detached display metadata whose id must equal `provider`.
   */
  providerInfo(provider) {
    return { id: provider, name: provider };
  }
  /**
   * Return the provider-owned retry policy captured with this route.
   * @param _provider - a route passed to `registerAdapter()` for this instance.
   * @returns a resolved policy, or `undefined` to use the normal defaults.
   */
  providerRetryPolicy(_provider) {
    return void 0;
  }
  /**
   * Resolve provider-side request-image pricing for one exact model route.
   * The default declares none, so consumers fall back to their own neutral
   * estimate. Implementations must answer synchronously without I/O; the
   * token meter resolves this per measurement.
   * @param _provider - a route passed to `registerAdapter()` for this instance.
   * @param _model - exact model id passed to {@link GenerateOptions.model}.
   * @returns route-owned image pricing, or `undefined` when the route declares none.
   */
  imageRequestPricing(_provider, _model) {
    return void 0;
  }
  /**
   * Resolve the image dimensions and byte target this adapter sends to the model.
   * The default preserves normalized images; adapters that resize must override it.
   * @param _provider - registered provider route.
   * @param _model - exact model id.
   * @param image - normalized image whose request projection is being resolved.
   * @returns the same target used by request serialization, before provider-internal processing.
   */
  imageRequestTarget(_provider, _model, image) {
    return { width: image.width, height: image.height, maxBytes: image.bytes };
  }
  /**
   * List models this adapter can currently advertise for one owned provider.
   * Core routing accepts unlisted model ids; catalog-driven entry points such
   * as the GUI may require membership. Adapters used there must advertise
   * their available models; the base empty catalog offers no GUI selection.
   * @param _provider - one provider route owned by this adapter.
   * @returns discoverable models in adapter-preferred order.
   */
  listModels(_provider) {
    return Promise.resolve([]);
  }
  /**
   * Resolve all metadata available for one exact model. This query is
   * independent of the advisory catalog and does not validate request routing.
   * @param provider - one provider route owned by this adapter.
   * @param model - exact model id passed to {@link GenerateOptions.model}.
   * @param _signal - cancellation for this exact-model lookup; asynchronous
   *   implementations must settle promptly after it aborts.
   * @returns provider/model identity plus any context, call-default, and reasoning metadata.
   */
  resolveModel(provider, model, _signal) {
    return Promise.resolve({ provider, id: model, name: model });
  }
  /**
   * Bind exact model metadata and the eventual request dispatch to one adapter generation.
   * Dynamic adapters override this so settings changes between preparation and
   * dispatch cannot combine one generation's capabilities with another's endpoint.
   * @param provider - registered provider route.
   * @param model - exact model id.
   * @param signal - cancellation for model resolution.
   * @returns model metadata and a one-generation stream entry point.
   */
  async prepareCall(provider, model, signal) {
    return {
      model: await this.resolveModel(provider, model, signal),
      stream: (options) => this.stream(options)
    };
  }
};
var _remoteDiscoverModels_dec, _listConfigurableProviders_dec, _listProviders_dec, _a, _init;
var LlmRuntime = class extends (_a = TypertRemoteService, _listProviders_dec = [Remote], _listConfigurableProviders_dec = [Remote], _remoteDiscoverModels_dec = [Remote("discoverModels")], _a) {
  constructor(ctx) {
    super(ctx, "llm");
    __runInitializers(_init, 5, this);
    __publicField(this, "adapters", /* @__PURE__ */ new Map());
    __publicField(this, "directory", /* @__PURE__ */ new Map());
    __publicField(this, "discoveries", /* @__PURE__ */ new Map());
  }
  /** Notify topology observers without letting one broken listener veto the commit. */
  emitAdaptersUpdated() {
    for (const listener of this.ctx.events.dispatch("emit", ["llm/adapters-updated"])) {
      try {
        const returned = listener();
        if (returned != null && typeof returned.then === "function") {
          void Promise.resolve(returned).then(void 0, (error) => {
            this.warnAdaptersListenerFailure(error);
          });
        }
      } catch (error) {
        this.warnAdaptersListenerFailure(error);
      }
    }
  }
  /** Contained-listener diagnostic shared by the sync and async failure paths. */
  warnAdaptersListenerFailure(error) {
    this.ctx.logger.warn("llm: an llm/adapters-updated listener failed");
    this.ctx.logger.warn(error);
  }
  /**
   * Register an adapter for the given provider routes. Throws `LlmError` with code
   * `DUPLICATE_ADAPTER` if any provider already has an adapter (all-or-nothing).
   * Disposed with the fiber.
   * @param providers - every provider route this adapter should serve.
   * @param adapter - the adapter that streams calls for those providers.
   * @returns the disposer, carrying {@link AdapterRegistrationHandle.replace}.
   */
  registerAdapter(providers, adapter) {
    const owned = /* @__PURE__ */ new Set();
    let released = false;
    const dispose = this.ctx.effect(function* () {
      if (providers.length === 0) throw new LlmError("an adapter must register at least one provider", "INVALID_ADAPTER");
      this.commitRoutes(owned, this.prepareRoutes(providers, adapter, owned));
      yield () => {
        released = true;
        for (const provider of owned) this.adapters.delete(provider);
        owned.clear();
        this.emitAdaptersUpdated();
      };
    }.bind(this), "llm.registerAdapter()");
    const handle = (() => void dispose());
    handle.replace = (next) => {
      if (released) {
        throw new LlmError("a disposed adapter registration cannot replace its routes", "REGISTRATION_DISPOSED");
      }
      this.commitRoutes(owned, this.prepareRoutes(next, adapter, owned));
    };
    return handle;
  }
  /**
   * Validate one candidate route set for `adapter`, treating routes this
   * registration already holds as available. Nothing is mutated: a rejected
   * candidate leaves the registry exactly as it was.
   */
  prepareRoutes(providers, adapter, owned) {
    const unique = /* @__PURE__ */ new Set();
    const registrations = [];
    for (const provider of providers) {
      if (provider.length === 0) throw new LlmError("adapter provider names must be non-empty", "INVALID_ADAPTER");
      if (unique.has(provider) || this.adapters.has(provider) && !owned.has(provider)) {
        throw new LlmError(`an adapter for provider "${provider}" is already registered`, "DUPLICATE_ADAPTER");
      }
      const info = adapter.providerInfo(provider);
      if (typeof info.id !== "string" || info.id !== provider || typeof info.name !== "string" || info.name.length === 0) {
        throw new LlmError(`adapter metadata for provider "${provider}" must preserve its id and have a non-empty name`, "INVALID_ADAPTER");
      }
      unique.add(provider);
      const retryPolicy = adapter.providerRetryPolicy(provider) ?? resolveRetryPolicy(void 0, `llm: provider "${provider}" retryPolicy`);
      registrations.push({
        adapter,
        provider: { id: info.id, name: info.name },
        retryPolicy
      });
    }
    return registrations;
  }
  /**
   * Swap this registration's routes for the prepared ones in one synchronous
   * section, so no observer can see the registry between the release and the
   * re-registration. The route set's one mutation point is also where
   * `llm/adapters-updated` is published, so a `replace` announces itself
   * exactly like a first registration.
   */
  commitRoutes(owned, registrations) {
    for (const provider of owned) this.adapters.delete(provider);
    owned.clear();
    for (const registration of registrations) {
      this.adapters.set(registration.provider.id, registration);
      owned.add(registration.provider.id);
    }
    this.emitAdaptersUpdated();
  }
  listProviders() {
    return [...this.adapters.values()].map(({ provider }) => ({ ...provider }));
  }
  /**
   * Declare provider routes an adapter plugin can activate through
   * configuration. Registration is all-or-nothing: an empty list, invalid
   * entry, or a provider already declared by any registration throws
   * `LlmError` without registering the rest. Disposed with the fiber.
   * @param entries - every configurable provider this plugin owns.
   * @returns a handle that withdraws all of them, and can atomically replace them.
   */
  registerConfigurableProviders(entries) {
    let held = [];
    let disposed = false;
    const commit = (candidates) => {
      const detached = [];
      const own = new Set(held.map((entry) => entry.provider));
      for (const entry of candidates) {
        if (entry.provider.length === 0 || entry.displayName.length === 0 || entry.settingsNs.length === 0) {
          throw new LlmError("configurable providers need a non-empty provider, displayName, and settingsNs", "INVALID_DIRECTORY");
        }
        if (entry.settingsPath.some((segment) => segment.length === 0)) {
          throw new LlmError(`configurable provider "${entry.provider}" has an empty settingsPath segment`, "INVALID_DIRECTORY");
        }
        if (this.directory.has(entry.provider) && !own.has(entry.provider) || detached.some((seen) => seen.provider === entry.provider)) {
          throw new LlmError(`configurable provider "${entry.provider}" is already declared`, "DUPLICATE_DIRECTORY");
        }
        detached.push(detachDirectoryEntry(entry));
      }
      for (const entry of held) this.directory.delete(entry.provider);
      for (const entry of detached) this.directory.set(entry.provider, entry);
      held = detached;
      this.emitAdaptersUpdated();
    };
    const dispose = this.ctx.effect(function* () {
      if (entries.length === 0) {
        throw new LlmError("a configurable-provider registration must declare at least one provider", "INVALID_DIRECTORY");
      }
      commit(entries);
      yield () => {
        disposed = true;
        for (const entry of held) this.directory.delete(entry.provider);
        held = [];
        this.emitAdaptersUpdated();
      };
    }.bind(this), "llm.registerConfigurableProviders()");
    const handle = (() => void dispose());
    handle.replace = (next) => {
      if (disposed) {
        throw new LlmError("this configurable-provider registration was disposed", "REGISTRATION_DISPOSED");
      }
      commit(next);
    };
    return handle;
  }
  listConfigurableProviders() {
    return [...this.directory.values()].map(detachDirectoryEntry);
  }
  /**
   * Offer to interrogate provider endpoints on behalf of the settings
   * namespace this plugin owns. The namespace is the key because that is what
   * a configuration surface already holds from the configurable-provider
   * directory, and because a provider being *added* has no route to name yet.
   * Disposed with the fiber.
   * @param settingsNs - the namespace whose profiles this discovery serves.
   * @param discover - interrogates one endpoint and must honor the supplied signal.
   * @returns the disposer that withdraws the offer.
   */
  registerModelDiscovery(settingsNs, discover) {
    const dispose = this.ctx.effect(function* () {
      if (settingsNs.length === 0) {
        throw new LlmError("model discovery needs a non-empty settings namespace", "INVALID_DISCOVERY");
      }
      if (this.discoveries.has(settingsNs)) {
        throw new LlmError(`model discovery for "${settingsNs}" is already registered`, "DUPLICATE_DISCOVERY");
      }
      this.discoveries.set(settingsNs, discover);
      yield () => {
        this.discoveries.delete(settingsNs);
      };
    }.bind(this), "llm.registerModelDiscovery()");
    return () => void dispose();
  }
  /**
   * Interrogate one provider endpoint for the models it advertises. The
   * request describes a draft, not a stored route, so nothing here reads or
   * writes settings or credentials — the caller owns both, and the reply is
   * candidate metadata a surface may offer for adoption.
   * @param settingsNs - namespace whose registered discovery serves this draft.
   * @param request - the endpoint, protocol, and one-shot credential to use.
   * @param signal - caller cancellation.
   * @returns the advertised models, deduplicated in endpoint order.
   */
  async discoverModels(settingsNs, request, signal) {
    const discover = this.discoveries.get(settingsNs);
    if (discover === void 0) {
      throw new LlmError(`no model discovery is registered for "${settingsNs}"`, "NO_DISCOVERY");
    }
    if ((request.provider ?? "").length === 0 && (request.baseURL ?? "").length === 0) {
      throw new LlmError("model discovery needs a provider route or a baseURL", "INVALID_DISCOVERY");
    }
    const discovered = signal === void 0 ? await discover(request) : await discover(request, signal);
    const seen = /* @__PURE__ */ new Set();
    const models = [];
    for (const model of discovered) {
      if (typeof model.id !== "string" || model.id.length === 0 || seen.has(model.id)) continue;
      seen.add(model.id);
      models.push({
        id: model.id,
        ...model.name === void 0 ? {} : { name: model.name },
        ...model.contextWindow === void 0 ? {} : { contextWindow: model.contextWindow },
        ...model.maxTokens === void 0 ? {} : { maxTokens: model.maxTokens },
        ...model.inputModalities === void 0 ? {} : { inputModalities: [...model.inputModalities] }
      });
    }
    return models;
  }
  async remoteDiscoverModels(settingsNs, request, signal) {
    try {
      return await this.discoverModels(settingsNs, request, signal);
    } catch (error) {
      throw new RemoteError(
        "llm/model-discovery-rejected",
        error instanceof Error ? error.message : String(error),
        {
          settingsNs,
          ...request.baseURL === void 0 ? {} : { baseURL: request.baseURL }
        },
        { cause: error }
      );
    }
  }
  /**
   * Resolve the retry policy captured when one provider route was registered.
   * @param provider - registered provider route to inspect.
   * @returns the provider-owned policy, with normal defaults already resolved.
   */
  providerRetryPolicy(provider) {
    return this.registration(provider).retryPolicy;
  }
  /**
   * Resolve provider-side request-image pricing for one exact route, or
   * `undefined` when the provider is unregistered or declares none. Unknown
   * providers degrade to `undefined` rather than throwing because callers
   * price durable history whose route may no longer be mounted.
   * @param provider - provider route named by a request header.
   * @param model - exact model id named by the same header.
   * @returns the owning adapter's image pricing for the route, when declared.
   */
  imageRequestPricing(provider, model) {
    return this.adapters.get(provider)?.adapter.imageRequestPricing(provider, model);
  }
  /**
   * Resolve the image projection for an exact registered model route.
   * @param provider - registered provider route.
   * @param model - exact model id.
   * @param image - normalized image reference.
   * @returns dimensions and byte target used by the adapter's request serializer.
   */
  imageRequestTarget(provider, model, image) {
    return this.registration(provider).adapter.imageRequestTarget(provider, model, image);
  }
  /**
   * Resolve the exact text one durable file occurrence contributes to every
   * provider request in the current execution environment.
   * @param ref - durable verbatim file reference from model history.
   * @returns the same deterministic handle text used at adapter dispatch.
   */
  fileRequestText(ref) {
    return fileHandleText(ref, this.fileReadPath(ref));
  }
  /** Detach typed adapter-owned modality metadata. */
  detachedModalities(modalities) {
    return modalities === void 0 ? void 0 : [...modalities];
  }
  /**
   * Discover models advertised by one registered provider. Catalog membership
   * does not constrain core routing. Catalog-driven entry points may restrict
   * selection and submission to the advertised models.
   * @param provider - registered provider route to inspect.
   * @returns detached model metadata in adapter-preferred order.
   */
  async listModels(provider) {
    const adapter = this.registration(provider).adapter;
    const models = await adapter.listModels(provider);
    const seen = /* @__PURE__ */ new Set();
    return models.map((model) => {
      if (typeof model.provider !== "string" || model.provider !== provider || typeof model.id !== "string" || model.id.length === 0 || typeof model.name !== "string" || model.name.length === 0 || model.description !== void 0 && typeof model.description !== "string" || seen.has(model.id)) {
        throw new LlmError(`adapter returned invalid or duplicate model metadata for provider "${provider}"`, "INVALID_CATALOG");
      }
      seen.add(model.id);
      const inputModalities = this.detachedModalities(model.inputModalities);
      const badge = model.badge;
      return {
        provider: model.provider,
        id: model.id,
        name: model.name,
        ...model.description === void 0 ? {} : { description: model.description },
        ...inputModalities === void 0 ? {} : { inputModalities },
        ...badge === void 0 ? {} : {
          badge: { text: typeof badge.text === "string" ? badge.text : { ...badge.text }, tone: badge.tone }
        }
      };
    });
  }
  /**
   * Resolve and validate all metadata from the adapter that owns one exact
   * route. The result is detached from adapter-owned objects; catalog
   * membership remains advisory and does not control request routing.
   * @param provider - registered provider route to inspect.
   * @param model - exact model id passed to the adapter.
   * @param signal - optional cancellation for adapter-owned asynchronous lookup.
   * @returns exact model identity plus available context and reasoning metadata.
   */
  async resolveModelInfo(provider, model, signal) {
    return this.resolveModelInfoFor(this.registration(provider), model, signal);
  }
  async resolveModelInfoFor(registration, model, signal) {
    const resolved = await registration.adapter.resolveModel(registration.provider.id, model, signal);
    return this.normalizeModelInfo(registration, model, resolved);
  }
  /** Validate and detach one adapter-returned exact model result. */
  normalizeModelInfo(registration, model, resolved) {
    const provider = registration.provider.id;
    if (typeof resolved.provider !== "string" || resolved.provider !== provider || typeof resolved.id !== "string" || resolved.id !== model || typeof resolved.name !== "string" || resolved.name.length === 0 || resolved.description !== void 0 && typeof resolved.description !== "string") {
      throw new LlmError(
        `adapter returned invalid exact model metadata for provider "${provider}" model "${model}"`,
        "INVALID_MODEL_INFO"
      );
    }
    const context = resolved.context;
    if (context !== void 0 && (!Number.isInteger(context.contextWindow) || context.contextWindow <= 0)) {
      throw new LlmError(
        `adapter returned invalid context metadata for provider "${provider}" model "${model}"`,
        "INVALID_MODEL_CONTEXT"
      );
    }
    const inputModalities = this.detachedModalities(resolved.inputModalities);
    const systemPromptUpdate = resolved.systemPromptUpdate;
    if (systemPromptUpdate !== void 0 && systemPromptUpdate !== "in-history") {
      throw new LlmError(
        `adapter returned invalid system prompt update mode for provider "${provider}" model "${model}"`,
        "INVALID_MODEL_INFO"
      );
    }
    const toolUpdate = resolved.toolUpdate;
    if (toolUpdate !== void 0 && toolUpdate !== "in-history" && toolUpdate !== "addition-only") {
      throw new LlmError(
        `adapter returned invalid tool update mode for provider "${provider}" model "${model}"`,
        "INVALID_MODEL_INFO"
      );
    }
    const defaultMaxTokens = resolved.defaultMaxTokens;
    if (defaultMaxTokens !== void 0 && (!Number.isSafeInteger(defaultMaxTokens) || defaultMaxTokens <= 0)) {
      throw new LlmError(
        `adapter returned invalid default maxTokens for provider "${provider}" model "${model}"`,
        "INVALID_MODEL_MAX_TOKENS"
      );
    }
    const info = {
      provider,
      id: model,
      name: resolved.name,
      ...resolved.description === void 0 ? {} : { description: resolved.description },
      ...inputModalities === void 0 ? {} : { inputModalities },
      ...context === void 0 ? {} : { context: { contextWindow: context.contextWindow } },
      ...defaultMaxTokens === void 0 ? {} : { defaultMaxTokens },
      ...resolved.systemPromptUpdate === void 0 ? {} : { systemPromptUpdate: resolved.systemPromptUpdate },
      ...resolved.toolUpdate === void 0 ? {} : { toolUpdate: resolved.toolUpdate }
    };
    const reasoning = resolved.reasoning;
    if (reasoning === void 0) return info;
    if (reasoning.efforts.length === 0) {
      throw new LlmError(
        `adapter returned invalid reasoning metadata for provider "${provider}" model "${model}"`,
        "INVALID_MODEL_REASONING"
      );
    }
    const seen = /* @__PURE__ */ new Set();
    const efforts = reasoning.efforts.map((effort) => {
      if (typeof effort.id !== "string" || effort.id.length === 0 || typeof effort.name !== "string" || effort.name.length === 0 || effort.description !== void 0 && typeof effort.description !== "string" || seen.has(effort.id)) {
        throw new LlmError(
          `adapter returned invalid or duplicate reasoning effort metadata for provider "${provider}" model "${model}"`,
          "INVALID_MODEL_REASONING"
        );
      }
      seen.add(effort.id);
      return {
        id: effort.id,
        name: effort.name,
        ...effort.description === void 0 ? {} : { description: effort.description }
      };
    });
    if (reasoning.defaultEffort !== void 0 && !seen.has(reasoning.defaultEffort)) {
      throw new LlmError(
        `adapter returned an unknown default reasoning effort for provider "${provider}" model "${model}"`,
        "INVALID_MODEL_REASONING"
      );
    }
    return {
      ...info,
      reasoning: {
        efforts,
        ...reasoning.defaultEffort === void 0 ? {} : { defaultEffort: reasoning.defaultEffort }
      }
    };
  }
  /**
   * Validate a conversation call config against its exact model capability and
   * materialize adapter-configured defaults. Unsupported explicit efforts
   * reject before provider I/O; no clamping or aliasing is performed. This
   * standalone query does not bind a later dispatch; use {@link prepareCall}
   * when logging and streaming must share one adapter registration.
   * @param config - provider/model route and optional request controls.
   * @param signal - optional cancellation for adapter-owned capability lookup.
   * @returns a detached config only when a default must be materialized.
   */
  async resolveCallConfig(config, signal) {
    return (await this.resolveCallFor(this.registration(config.provider), config, signal)).config;
  }
  async resolveCallFor(registration, config, signal) {
    const info = await this.resolveModelInfoFor(registration, config.model, signal);
    return this.resolveCallWithInfo(config, info);
  }
  /** Validate request controls against one already-bound exact model result. */
  resolveCallWithInfo(config, info) {
    const defaulted = config.maxTokens === void 0 && info.defaultMaxTokens !== void 0 ? { ...config, maxTokens: info.defaultMaxTokens } : config;
    const reasoning = info.reasoning;
    const requested = defaulted.reasoningEffort;
    let resolvedConfig = defaulted;
    if (reasoning === void 0) {
      if (requested !== void 0) {
        throw new LlmError(
          `provider "${config.provider}" model "${config.model}" does not support reasoning effort "${requested}"`,
          "UNSUPPORTED_REASONING_EFFORT"
        );
      }
    } else {
      const effective = requested ?? reasoning.defaultEffort;
      if (effective !== void 0) {
        if (!reasoning.efforts.some((effort) => effort.id === effective)) {
          throw new LlmError(
            `provider "${config.provider}" model "${config.model}" does not support reasoning effort "${effective}"`,
            "UNSUPPORTED_REASONING_EFFORT"
          );
        }
        if (requested !== effective) resolvedConfig = { ...defaulted, reasoningEffort: effective };
      }
    }
    return {
      config: resolvedConfig,
      ...info.context === void 0 ? {} : { context: info.context },
      modelInfo: info
    };
  }
  /**
   * Resolve one call under its current adapter registration. The returned
   * one-shot handle keeps that registration across header logging and dispatch,
   * so HMR cannot combine one adapter's capability result with another adapter.
   * An optional synchronous callback selects concrete controls using captured
   * model metadata. Defaults and validation apply to its result. Callback
   * failures and cancellation reject preparation before dispatch.
   * @param config - provider/model route and optional concrete request controls.
   * @param signal - optional cancellation for adapter-owned capability lookup.
   * @param configure - pure control selection, called once before defaults and validation.
   * @returns a prepared config and its registration-bound stream entry point.
   */
  async prepareCall(config, signal, configure) {
    signal?.throwIfAborted();
    const { provider, model, ...controls } = config;
    const registration = this.registration(provider);
    const adapterCall = await registration.adapter.prepareCall(provider, model, signal);
    signal?.throwIfAborted();
    const modelInfo2 = this.normalizeModelInfo(registration, model, adapterCall.model);
    const proposed = configure === void 0 ? config : { ...configure(deepFreeze(structuredClone(controls)), deepFreeze(modelInfo2)), provider, model };
    signal?.throwIfAborted();
    const resolved = this.resolveCallWithInfo(proposed, modelInfo2);
    const resolvedConfig = deepFreeze(structuredClone(resolved.config));
    const context = resolved.context === void 0 ? void 0 : deepFreeze(structuredClone(resolved.context));
    const adapterDefaults = deepFreeze({
      ...proposed.reasoningEffort === void 0 && resolvedConfig.reasoningEffort !== void 0 ? { reasoningEffort: true } : {},
      ...proposed.maxTokens === void 0 && resolvedConfig.maxTokens !== void 0 ? { maxTokens: true } : {}
    });
    let dispatched = false;
    return Object.freeze({
      config: resolvedConfig,
      retryPolicy: registration.retryPolicy,
      adapterDefaults,
      ...context === void 0 ? {} : { context },
      ...modelInfo2.inputModalities === void 0 ? {} : { inputModalities: Object.freeze([...modelInfo2.inputModalities]) },
      ...modelInfo2.systemPromptUpdate === void 0 ? {} : { systemPromptUpdate: modelInfo2.systemPromptUpdate },
      ...modelInfo2.toolUpdate === void 0 ? {} : { toolUpdate: modelInfo2.toolUpdate },
      stream: (options) => {
        if (dispatched) {
          throw new LlmError("a prepared LLM call can only be dispatched once", "INVALID_PREPARED_CALL");
        }
        if (!callConfigEquals(options, resolvedConfig)) {
          throw new LlmError(
            "prepared LLM call config changed before adapter dispatch",
            "INVALID_PREPARED_CALL"
          );
        }
        dispatched = true;
        return this.streamWithRegistration(options, {
          registration,
          config: resolvedConfig,
          modelInfo: modelInfo2,
          dispatch: (options2) => adapterCall.stream(options2)
        });
      }
    });
  }
  registration(provider) {
    const registration = this.adapters.get(provider);
    if (!registration) throw new LlmError(`no adapter registered for provider "${provider}"`, "NO_ADAPTER");
    return registration;
  }
  /** Remove replay state whose historical route is owned by another adapter. */
  forAdapter(options, adapter) {
    const messages = options.messages.map((message) => {
      if (message.role !== "assistant") return message;
      const source = message.source;
      if (source.replayState === void 0) return message;
      if (this.adapters.get(source.provider)?.adapter === adapter) return message;
      return freezeMessage({
        ...message,
        source: { kind: "model", provider: source.provider, model: source.model }
      });
    });
    if (messages.every((message, index) => message === options.messages[index])) return options;
    const filtered = { ...options, messages };
    return Object.isFrozen(options) ? deepFreeze(filtered) : filtered;
  }
  /**
   * Resolve the current execution-world read path of one durable file
   * reference through the mounted attachment and filesystem providers.
   */
  fileReadPath(ref) {
    let hostPath;
    try {
      hostPath = this.ctx.get("attachments")?.fileHostPath(ref);
    } catch {
      return void 0;
    }
    if (hostPath === void 0) return void 0;
    const fs = this.ctx.get("fs");
    return fs?.processPathFromHostPath(hostPath);
  }
  /**
   * Final adapter boundary. Adapter selection, dispatch, iterator construction,
   * and iteration failures become one terminal failure chunk. Middleware and
   * downstream consumer failures remain thrown plugin or consumer errors.
   */
  async *adapterStream(options, prepared) {
    let iterator;
    try {
      const registration = prepared?.registration ?? this.registration(options.provider);
      const adapter = registration.adapter;
      let modelInfo2;
      let resolvedConfig;
      let dispatch;
      if (prepared === void 0) {
        const adapterCall = await adapter.prepareCall(options.provider, options.model, options.signal);
        modelInfo2 = this.normalizeModelInfo(registration, options.model, adapterCall.model);
        resolvedConfig = this.resolveCallWithInfo(options, modelInfo2).config;
        dispatch = (options2) => adapterCall.stream(options2);
      } else {
        modelInfo2 = prepared.modelInfo;
        resolvedConfig = prepared.config;
        dispatch = prepared.dispatch;
      }
      if (prepared !== void 0 && !callConfigEquals(options, resolvedConfig)) {
        throw new LlmError(
          "prepared LLM call config changed before adapter dispatch",
          "INVALID_PREPARED_CALL"
        );
      }
      const resolvedOptions = callConfigEquals(options, resolvedConfig) ? options : Object.isFrozen(options) ? deepFreeze({ ...options, ...resolvedConfig }) : { ...options, ...resolvedConfig };
      let projectedMessages = resolvedOptions.messages;
      if (projectedMessages.some((message) => contentHasFile(message.content))) {
        projectedMessages = projectFilesToText(projectedMessages, (ref) => this.fileReadPath(ref));
      }
      if (modelInfo2.inputModalities !== void 0 && !modelInfo2.inputModalities.includes("image") && projectedMessages.some((message) => contentHasImage(message.content))) {
        projectedMessages = projectImagesForTextModel(projectedMessages);
      }
      const projectedTools = projectToolUpdates(projectedMessages, resolvedOptions.tools, modelInfo2.toolUpdate, resolvedOptions.toolHistory);
      projectedMessages = projectedTools.messages;
      let projectedOptions = resolvedOptions;
      if (projectedMessages !== resolvedOptions.messages || projectedTools.tools !== resolvedOptions.tools) {
        projectedOptions = {
          ...resolvedOptions,
          messages: projectedMessages,
          ...projectedTools.tools === void 0 ? {} : { tools: projectedTools.tools }
        };
        if (Object.isFrozen(resolvedOptions)) deepFreeze(projectedOptions);
      }
      const stream = dispatch(this.forAdapter(projectedOptions, adapter));
      iterator = stream[Symbol.asyncIterator]();
    } catch (error) {
      yield adapterFailureChunk(error, options.signal);
      return;
    }
    let completed = false;
    try {
      while (true) {
        let item;
        try {
          const next = await iterator.next();
          item = next.done ? { done: true } : { done: false, value: next.value };
        } catch (error) {
          completed = true;
          yield adapterFailureChunk(error, options.signal);
          return;
        }
        if (item.done) {
          completed = true;
          return;
        }
        yield item.value;
      }
    } finally {
      if (!completed) {
        const close = iterator.return?.bind(iterator);
        if (close) await close();
      }
    }
  }
  /**
   * Stream one model call as raw chunks (token-level deltas). Replay state is
   * retained only when the same adapter instance owns its historical provider
   * and the target provider. Final adapter selection remains fixed through
   * asynchronous exact-model resolution and dispatch. Adapter selection,
   * dispatch, and iteration failures become terminal `error` or `aborted`
   * finish chunks; middleware, nested-call, cleanup, and consumer failures
   * remain thrown.
   * @param options - the full request; `options.provider` selects the adapter.
   * @returns the chunk stream, possibly wrapped by `llm/stream` listeners.
   */
  stream(options) {
    return this.streamWithRegistration(options);
  }
  streamWithRegistration(options, prepared) {
    return this.ctx.waterfall(
      this,
      "llm/stream",
      options,
      () => this.adapterStream(options, prepared)
    );
  }
};
_init = __decoratorStart(_a);
__decorateElement(_init, 1, "listProviders", _listProviders_dec, LlmRuntime);
__decorateElement(_init, 1, "listConfigurableProviders", _listConfigurableProviders_dec, LlmRuntime);
__decorateElement(_init, 1, "remoteDiscoverModels", _remoteDiscoverModels_dec, LlmRuntime);
__decoratorMetadata(_init, LlmRuntime);
function adapterFailureChunk(error, signal) {
  const failure = normalizeLlmFailure(error);
  return {
    type: "finish",
    reason: signal?.aborted || failure.code === "ABORTED" ? { kind: "aborted", failure } : { kind: "error", failure }
  };
}
function detachDirectoryEntry(entry) {
  const { nativeAuth } = entry;
  return {
    ...entry,
    settingsPath: [...entry.settingsPath],
    ...entry.baseURLEnv === void 0 ? {} : { baseURLEnv: [...entry.baseURLEnv] },
    ...nativeAuth === void 0 ? {} : { nativeAuth: { ...nativeAuth, env: [...nativeAuth.env] } }
  };
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/models.ts
var OFFICIAL_CONTEXT_WINDOW = 1048576;
var DEFAULT_MODELS = [
  {
    id: "deepseek-flash",
    name: "DeepSeek-V4.1-Flash",
    contextWindow: OFFICIAL_CONTEXT_WINDOW,
    inputModalities: ["text", "image"],
    systemPromptUpdate: "in-history",
    toolUpdate: "addition-only"
  },
  {
    id: "deepseek-v4-pro",
    name: "DeepSeek-V4-Pro",
    description: "Stronger agentic coding, knowledge, and difficult reasoning; suited to complex or quality-critical tasks at higher cost.",
    contextWindow: OFFICIAL_CONTEXT_WINDOW
  }
];

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/defaults.ts
var DEFAULT_STREAM_IDLE_TIMEOUT_MS = 3e5;
var DEFAULT_CONTEXT_WINDOW = 1e6;
var DEFAULT_MAX_TOKENS = 256e3;
var DEFAULT_MAX_INLINE_REQUEST_IMAGE_BYTES = 20 * 1024 * 1024;
var DEFAULT_IMAGE_OFFLOAD_BYTE_QUANTUM = 64 * 1024 * 1024;
var DEFAULT_INLINE_IMAGE_OFFLOAD_BYTE_QUANTUM = 10 * 1024 * 1024;
var DEFAULT_IMAGE_OFFLOAD_COUNT_QUANTUM = 20;
var DEFAULT_FILE_EXPIRY_SECONDS = 7 * 24 * 60 * 60;
var DEFAULT_FILE_REFRESH_MARGIN_SECONDS = 60 * 60;
var DEFAULT_FILE_QUOTA_CLEANUP_BATCH = 100;
var DEFAULT_FILES_API_TIMEOUT_MS = 6e4;

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/attachment/attachment/src/index.ts
import { Buffer as Buffer3 } from "node:buffer";

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/attachment/attachment/src/admission.ts
import { Buffer as Buffer2 } from "node:buffer";

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/attachment/attachment/src/error.ts
var IMAGE_ADMISSION_ERROR_CODES = [
  "TOO_MANY_IMAGES",
  "IMAGES_TOO_LARGE",
  "UNSUPPORTED_IMAGE_TYPE",
  "INVALID_IMAGE_BASE64",
  "INVALID_IMAGE",
  "IMAGE_TYPE_MISMATCH",
  "IMAGE_TOO_LARGE",
  "IMAGE_TOO_MANY_PIXELS",
  "IMAGE_DIMENSION_TOO_LARGE"
];
var ATTACHMENT_ERROR_CODES = [
  ...IMAGE_ADMISSION_ERROR_CODES,
  "INVALID_FILE_BASE64",
  "INVALID_ATTACHMENT_REF",
  "ATTACHMENT_CORRUPT",
  "ATTACHMENT_WRITE_FAILED",
  "ATTACHMENT_NOT_FOUND",
  "ATTACHMENT_READ_FAILED",
  "ATTACHMENT_PROJECTION_UNSUPPORTED",
  "ATTACHMENT_FILES_UNSUPPORTED"
];
var IMAGE_ADMISSION_ERROR_CODE_SET = new Set(IMAGE_ADMISSION_ERROR_CODES);
var ATTACHMENT_ERROR_CODE_SET = new Set(ATTACHMENT_ERROR_CODES);

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/attachment/attachment/src/brand.ts
function ImageVariantId(value) {
  return value;
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/attachment/attachment/src/request-projection.ts
function requestImageDimensions(width, height, maxPixels) {
  const scale = Math.min(1, Math.sqrt(maxPixels / (width * height)));
  if (scale === 1) return { width, height };
  if (width >= height) {
    let projectedWidth2 = Math.max(1, Math.floor(width * scale));
    let projectedHeight2 = Math.max(1, Math.round(projectedWidth2 * height / width));
    while (projectedWidth2 * projectedHeight2 > maxPixels && projectedWidth2 > 1) {
      projectedWidth2 -= 1;
      projectedHeight2 = Math.max(1, Math.round(projectedWidth2 * height / width));
    }
    return { width: projectedWidth2, height: projectedHeight2 };
  }
  let projectedHeight = Math.max(1, Math.floor(height * scale));
  let projectedWidth = Math.max(1, Math.round(projectedHeight * width / height));
  while (projectedWidth * projectedHeight > maxPixels && projectedHeight > 1) {
    projectedHeight -= 1;
    projectedWidth = Math.max(1, Math.round(projectedHeight * width / height));
  }
  return { width: projectedWidth, height: projectedHeight };
}
function longEdgeDimensions(width, height, longEdge) {
  if (longEdge >= Math.max(width, height)) return { width, height };
  return width >= height ? { width: longEdge, height: Math.max(1, Math.round(longEdge * height / width)) } : { width: Math.max(1, Math.round(longEdge * width / height)), height: longEdge };
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/image-tokens.ts
var PATCH_SIZE = 14;
var DOWNSAMPLE_RATIO = 3;
var MAX_IMAGE_TOKENS = 1024;
var MIN_PIXELS = 544 * 544;
var CELL_SIZE = PATCH_SIZE * DOWNSAMPLE_RATIO;
var intDiv = (value, divisor) => Math.floor(value / divisor);
var ceilDiv = (value, divisor) => Math.floor((value + divisor - 1) / divisor);
function gridTokens(gridHeight, gridWidth) {
  return gridHeight * (gridWidth + 1) + 2;
}
function gridCells(paddedLength) {
  return ceilDiv(intDiv(paddedLength, PATCH_SIZE), DOWNSAMPLE_RATIO);
}
function solveResizeRatio(height, width, budget) {
  const aspect = height / width;
  const idealGridWidth = Math.sqrt((budget - 2) / aspect + 0.25) - 0.5;
  const idealGridHeight = idealGridWidth * aspect;
  let bestHeight;
  let bestWidth;
  if (idealGridWidth < 1) {
    const solvedGridWidth = 1;
    const solvedGridHeight = intDiv(budget - 2, solvedGridWidth + 1);
    bestWidth = solvedGridWidth * CELL_SIZE;
    bestHeight = solvedGridHeight * CELL_SIZE;
  } else if (idealGridHeight < 1) {
    const solvedGridHeight = 1;
    const solvedGridWidth = intDiv(budget - 2, solvedGridHeight) - 1;
    bestWidth = solvedGridWidth * CELL_SIZE;
    bestHeight = solvedGridHeight * CELL_SIZE;
  } else {
    const solvedGridWidth = Math.trunc(idealGridWidth);
    const solvedGridHeight = Math.trunc(idealGridHeight);
    const scale = Math.min(solvedGridWidth * CELL_SIZE / width, solvedGridHeight * CELL_SIZE / height);
    bestWidth = Math.trunc(width * scale / PATCH_SIZE) * PATCH_SIZE;
    bestHeight = Math.trunc(height * scale / PATCH_SIZE) * PATCH_SIZE;
  }
  const gridHeight = gridCells(bestHeight);
  const gridWidth = gridCells(bestWidth);
  return { gridHeight, gridWidth, bestHeight, bestWidth, numTokens: gridTokens(gridHeight, gridWidth) };
}
function safeResize(height, width, paddedHeight, paddedWidth) {
  const gridHeight = gridCells(paddedHeight);
  const gridWidth = gridCells(paddedWidth);
  const direct = {
    gridHeight,
    gridWidth,
    bestHeight: paddedHeight,
    bestWidth: paddedWidth,
    numTokens: gridTokens(gridHeight, gridWidth)
  };
  if (direct.numTokens <= MAX_IMAGE_TOKENS) return direct;
  const solved = solveResizeRatio(height, width, MAX_IMAGE_TOKENS);
  if (solved.numTokens > MAX_IMAGE_TOKENS) {
    throw new Error(`deepseek image tokens: no grid fits the token budget for ${width}x${height}`);
  }
  return solved;
}
function resizeOnce(width, height) {
  let scaledWidth = width;
  let scaledHeight = height;
  const pixels = scaledWidth * scaledHeight;
  if (pixels < MIN_PIXELS && pixels > 0) {
    const scale = Math.sqrt(MIN_PIXELS / pixels);
    scaledWidth = Math.trunc(scaledWidth * scale);
    scaledHeight = Math.trunc(scaledHeight * scale);
  }
  const paddedWidth = ceilDiv(scaledWidth, PATCH_SIZE) * PATCH_SIZE;
  const paddedHeight = ceilDiv(scaledHeight, PATCH_SIZE) * PATCH_SIZE;
  return safeResize(scaledHeight, scaledWidth, paddedHeight, paddedWidth);
}
function sameResize(a, b) {
  return a.gridHeight === b.gridHeight && a.gridWidth === b.gridWidth && a.bestHeight === b.bestHeight && a.bestWidth === b.bestWidth && a.numTokens === b.numTokens;
}
function deepSeekRequestImageDimensions(width, height) {
  const paddedWidth = ceilDiv(width, PATCH_SIZE) * PATCH_SIZE;
  const paddedHeight = ceilDiv(height, PATCH_SIZE) * PATCH_SIZE;
  if (gridTokens(gridCells(paddedHeight), gridCells(paddedWidth)) <= MAX_IMAGE_TOKENS) return { width, height };
  const solved = solveResizeRatio(height, width, MAX_IMAGE_TOKENS);
  return longEdgeDimensions(width, height, width >= height ? solved.bestWidth : solved.bestHeight);
}
function deepSeekImageTokens(width, height) {
  let result = resizeOnce(width, height);
  for (let iteration = 1; iteration < 10; iteration += 1) {
    const next = resizeOnce(result.bestWidth, result.bestHeight);
    if (sameResize(next, result)) return result.numTokens;
    result = next;
  }
  throw new Error(`deepseek image tokens: resize did not converge for ${width}x${height}`);
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/request-pricing.ts
var DEFAULT_MAX_REQUEST_FILES_BYTES = 128 * 1024 * 1024;
var DEFAULT_MAX_IMAGES_PER_REQUEST = 600;
var DEFAULT_LOW_DETAIL_IMAGE_PIXEL_BUDGET = 512 * 512;
var DEFAULT_REQUEST_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
var REQUEST_IMAGE_MAX_DIMENSION = 4096;
function resolveRequestImageMaxBytes(model) {
  return model.imageMaxBytes ?? DEFAULT_REQUEST_IMAGE_MAX_BYTES;
}
function resolveRequestImageTarget(model, source) {
  const budget = model.imagePixelBudget === "low" ? DEFAULT_LOW_DETAIL_IMAGE_PIXEL_BUDGET : model.imagePixelBudget;
  const projected = budget === void 0 ? deepSeekRequestImageDimensions(source.width, source.height) : requestImageDimensions(source.width, source.height, budget);
  const capped = Math.max(projected.width, projected.height) > REQUEST_IMAGE_MAX_DIMENSION ? longEdgeDimensions(source.width, source.height, REQUEST_IMAGE_MAX_DIMENSION) : projected;
  return { ...capped, maxBytes: resolveRequestImageMaxBytes(model) };
}
function textOnlyPrice(block) {
  return { visualTokens: 0, text: textOnlyImageText(block.attachment) };
}
function deepSeekImageRequestPricing(connection, model, resolveAccess) {
  const catalogModel2 = connection.models.find((entry) => entry.id === model);
  if (catalogModel2?.inputModalities?.includes("image") !== true) {
    return { priceImages: (images) => images.map(textOnlyPrice) };
  }
  return {
    priceImages: (images) => images.map(({ attachment: ref, offloaded }) => {
      if (offloaded === true) {
        return { visualTokens: 0, text: offloadedImageText(ref, resolveAccess?.(ref)) };
      }
      const target = resolveRequestImageTarget(catalogModel2, ref);
      return {
        visualTokens: deepSeekImageTokens(target.width, target.height),
        text: requestImageHandleText(ref, target, resolveAccess?.(ref))
      };
    })
  };
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/config.ts
var MODEL_MODALITIES = ["text", "image"];
var catalogModelFields = {
  name: src_default.string(),
  description: src_default.string(),
  contextWindow: src_default.number().step(1).min(1),
  maxTokens: src_default.number().step(1).min(1),
  imagePixelBudget: src_default.union([src_default.number().step(1).min(1), "low"]),
  imageMaxBytes: src_default.number().step(1).min(1),
  systemPromptUpdate: src_default.const("in-history"),
  toolUpdate: src_default.union(["in-history", "addition-only"])
};
var catalogModel = src_default.object({
  id: src_default.string().required(),
  ...catalogModelFields,
  inputModalities: src_default.array(src_default.union(MODEL_MODALITIES)).min(1).default(["text"])
});
var deepSeekConfigFields = {
  baseURL: src_default.string().volatile(),
  thinking: src_default.union(["enabled", "disabled"]).volatile(),
  reasoningEffort: src_default.union(["off", "low", "high", "max"]).volatile(),
  maxTokens: src_default.number().step(1).min(1).max(Number.MAX_SAFE_INTEGER).default(DEFAULT_MAX_TOKENS).volatile(),
  defaultContextWindow: src_default.number().step(1).min(1).default(DEFAULT_CONTEXT_WINDOW).volatile(),
  models: src_default.array(catalogModel).default(DEFAULT_MODELS).volatile(),
  streamIdleTimeoutMs: src_default.number().min(Number.MIN_VALUE).max(MAX_TIMER_DELAY_MS).default(DEFAULT_STREAM_IDLE_TIMEOUT_MS).volatile(),
  maxRequestFilesBytes: src_default.number().step(1).min(1).default(DEFAULT_MAX_REQUEST_FILES_BYTES).volatile(),
  maxInlineRequestImageBytes: src_default.number().step(1).min(1).default(DEFAULT_MAX_INLINE_REQUEST_IMAGE_BYTES).volatile(),
  maxImagesPerRequest: src_default.number().step(1).min(1).default(DEFAULT_MAX_IMAGES_PER_REQUEST).volatile(),
  imageOffloadByteQuantum: src_default.number().step(1).min(1).default(DEFAULT_IMAGE_OFFLOAD_BYTE_QUANTUM).volatile(),
  inlineImageOffloadByteQuantum: src_default.number().step(1).min(1).default(DEFAULT_INLINE_IMAGE_OFFLOAD_BYTE_QUANTUM).volatile(),
  imageOffloadCountQuantum: src_default.number().step(1).min(1).default(DEFAULT_IMAGE_OFFLOAD_COUNT_QUANTUM).volatile(),
  filesApiTimeoutMs: src_default.number().min(Number.MIN_VALUE).max(MAX_TIMER_DELAY_MS).default(DEFAULT_FILES_API_TIMEOUT_MS).volatile(),
  fileExpiresAfterSeconds: src_default.number().step(1).min(3600).max(2592e3).default(DEFAULT_FILE_EXPIRY_SECONDS).volatile(),
  fileRefreshMarginSeconds: src_default.number().step(1).min(0).default(DEFAULT_FILE_REFRESH_MARGIN_SECONDS).volatile(),
  fileQuotaCleanupBatch: src_default.number().step(1).min(1).max(1e3).default(DEFAULT_FILE_QUOTA_CLEANUP_BATCH).volatile(),
  retryPolicy: RetryPolicySchema.volatile()
};
var Config = src_default.object(deepSeekConfigFields);
var PUBLIC_BASE_URL = "https://api.deepseek.com/anthropic";
var BASE_URL_ENV = "DEEPSEEK_BASE_URL";
function resolveModels(models) {
  const seen = /* @__PURE__ */ new Set();
  return (models ?? DEFAULT_MODELS).map((model) => {
    if (Object.hasOwn(model, "imageDetail")) {
      throw new Error("llm-deepseek: catalog model imageDetail is no longer supported; use imagePixelBudget");
    }
    if (model.id.length === 0) throw new Error("llm-deepseek: catalog model ids must be non-empty");
    if (model.name !== void 0 && model.name.length === 0) {
      throw new Error(`llm-deepseek: catalog model "${model.id}" has an empty name`);
    }
    if (model.contextWindow !== void 0 && (!Number.isInteger(model.contextWindow) || model.contextWindow <= 0)) {
      throw new Error(
        `llm-deepseek: catalog model "${model.id}" contextWindow must be a positive integer`
      );
    }
    if (model.maxTokens !== void 0 && (!Number.isInteger(model.maxTokens) || model.maxTokens <= 0)) {
      throw new Error(
        `llm-deepseek: catalog model "${model.id}" maxTokens must be a positive integer`
      );
    }
    const inputModalities = model.inputModalities ?? ["text"];
    if (inputModalities.length === 0) {
      throw new Error(`llm-deepseek: catalog model "${model.id}" inputModalities must not be empty`);
    }
    if (inputModalities.some((modality) => !MODEL_MODALITIES.includes(modality))) {
      throw new Error(
        `llm-deepseek: catalog model "${model.id}" inputModalities must contain only "text" and "image"`
      );
    }
    if (new Set(inputModalities).size !== inputModalities.length) {
      throw new Error(`llm-deepseek: catalog model "${model.id}" inputModalities must not contain duplicates`);
    }
    const hasImage = inputModalities.includes("image");
    if (!hasImage && (model.imagePixelBudget !== void 0 || model.imageMaxBytes !== void 0)) {
      throw new Error(`llm-deepseek: text-only catalog model "${model.id}" cannot declare image request limits`);
    }
    if (model.imagePixelBudget !== void 0 && model.imagePixelBudget !== "low" && (!Number.isSafeInteger(model.imagePixelBudget) || model.imagePixelBudget <= 0)) {
      throw new Error(`llm-deepseek: catalog model "${model.id}" imagePixelBudget must be "low" or a positive safe integer`);
    }
    if (model.imageMaxBytes !== void 0 && (!Number.isSafeInteger(model.imageMaxBytes) || model.imageMaxBytes <= 0)) {
      throw new Error(`llm-deepseek: catalog model "${model.id}" imageMaxBytes must be a positive safe integer`);
    }
    const systemPromptUpdate = model.systemPromptUpdate;
    if (systemPromptUpdate !== void 0 && systemPromptUpdate !== "in-history") {
      throw new Error(`llm-deepseek: catalog model "${model.id}" systemPromptUpdate must be "in-history" when present`);
    }
    const toolUpdate = model.toolUpdate;
    if (toolUpdate !== void 0 && toolUpdate !== "in-history" && toolUpdate !== "addition-only") {
      throw new Error(`llm-deepseek: catalog model "${model.id}" toolUpdate must be "in-history" or "addition-only" when present`);
    }
    if (seen.has(model.id)) throw new Error(`llm-deepseek: duplicate catalog model "${model.id}"`);
    seen.add(model.id);
    return {
      id: model.id,
      ...model.name === void 0 ? {} : { name: model.name },
      ...model.description === void 0 ? {} : { description: model.description },
      ...model.contextWindow === void 0 ? {} : { contextWindow: model.contextWindow },
      ...model.maxTokens === void 0 ? {} : { maxTokens: model.maxTokens },
      ...model.systemPromptUpdate === void 0 ? {} : { systemPromptUpdate: model.systemPromptUpdate },
      ...model.toolUpdate === void 0 ? {} : { toolUpdate: model.toolUpdate },
      inputModalities: [...inputModalities],
      ...hasImage ? {
        ...model.imagePixelBudget === void 0 ? {} : { imagePixelBudget: model.imagePixelBudget },
        imageMaxBytes: model.imageMaxBytes ?? DEFAULT_REQUEST_IMAGE_MAX_BYTES
      } : {}
    };
  });
}
function resolveAdapterOptions(config, environment) {
  if (Object.hasOwn(config, "protocol")) {
    throw new Error("llm-deepseek: protocol is not configurable; remove it and use a Messages-compatible baseURL");
  }
  if (config.thinking === "disabled" && config.reasoningEffort !== void 0 && config.reasoningEffort !== "off") {
    throw new Error('llm-deepseek: only reasoningEffort "off" can be configured when thinking is disabled');
  }
  if (config.defaultContextWindow !== void 0 && (!Number.isInteger(config.defaultContextWindow) || config.defaultContextWindow <= 0)) {
    throw new Error("llm-deepseek: defaultContextWindow must be a positive integer");
  }
  if (config.maxTokens !== void 0 && (!Number.isSafeInteger(config.maxTokens) || config.maxTokens <= 0)) {
    throw new Error("llm-deepseek: maxTokens must be a positive safe integer");
  }
  const streamIdleTimeoutMs = config.streamIdleTimeoutMs ?? DEFAULT_STREAM_IDLE_TIMEOUT_MS;
  if (!Number.isFinite(streamIdleTimeoutMs) || streamIdleTimeoutMs <= 0 || streamIdleTimeoutMs > MAX_TIMER_DELAY_MS) {
    throw new Error(
      `llm-deepseek: streamIdleTimeoutMs must be a positive finite number no greater than ${MAX_TIMER_DELAY_MS}`
    );
  }
  const maxRequestFilesBytes = config.maxRequestFilesBytes ?? DEFAULT_MAX_REQUEST_FILES_BYTES;
  if (!Number.isSafeInteger(maxRequestFilesBytes) || maxRequestFilesBytes <= 0) {
    throw new Error("llm-deepseek: maxRequestFilesBytes must be a positive safe integer");
  }
  const maxInlineRequestImageBytes = config.maxInlineRequestImageBytes ?? DEFAULT_MAX_INLINE_REQUEST_IMAGE_BYTES;
  if (!Number.isSafeInteger(maxInlineRequestImageBytes) || maxInlineRequestImageBytes <= 0) {
    throw new Error("llm-deepseek: maxInlineRequestImageBytes must be a positive safe integer");
  }
  const maxImagesPerRequest = config.maxImagesPerRequest ?? DEFAULT_MAX_IMAGES_PER_REQUEST;
  if (!Number.isSafeInteger(maxImagesPerRequest) || maxImagesPerRequest <= 0) {
    throw new Error("llm-deepseek: maxImagesPerRequest must be a positive safe integer");
  }
  const imageOffloadByteQuantum = config.imageOffloadByteQuantum ?? DEFAULT_IMAGE_OFFLOAD_BYTE_QUANTUM;
  if (!Number.isSafeInteger(imageOffloadByteQuantum) || imageOffloadByteQuantum <= 0) {
    throw new Error("llm-deepseek: imageOffloadByteQuantum must be a positive safe integer");
  }
  if (imageOffloadByteQuantum > maxRequestFilesBytes) {
    throw new Error("llm-deepseek: imageOffloadByteQuantum must not exceed maxRequestFilesBytes");
  }
  const inlineImageOffloadByteQuantum = config.inlineImageOffloadByteQuantum ?? DEFAULT_INLINE_IMAGE_OFFLOAD_BYTE_QUANTUM;
  if (!Number.isSafeInteger(inlineImageOffloadByteQuantum) || inlineImageOffloadByteQuantum <= 0) {
    throw new Error("llm-deepseek: inlineImageOffloadByteQuantum must be a positive safe integer");
  }
  if (inlineImageOffloadByteQuantum > maxInlineRequestImageBytes) {
    throw new Error("llm-deepseek: inlineImageOffloadByteQuantum must not exceed maxInlineRequestImageBytes");
  }
  const imageOffloadCountQuantum = config.imageOffloadCountQuantum ?? DEFAULT_IMAGE_OFFLOAD_COUNT_QUANTUM;
  if (!Number.isSafeInteger(imageOffloadCountQuantum) || imageOffloadCountQuantum <= 0) {
    throw new Error("llm-deepseek: imageOffloadCountQuantum must be a positive safe integer");
  }
  if (imageOffloadCountQuantum > maxImagesPerRequest) {
    throw new Error("llm-deepseek: imageOffloadCountQuantum must not exceed maxImagesPerRequest");
  }
  const filesApiTimeoutMs = config.filesApiTimeoutMs ?? DEFAULT_FILES_API_TIMEOUT_MS;
  if (!Number.isFinite(filesApiTimeoutMs) || filesApiTimeoutMs <= 0 || filesApiTimeoutMs > MAX_TIMER_DELAY_MS) {
    throw new Error(
      `llm-deepseek: filesApiTimeoutMs must be a positive finite number no greater than ${MAX_TIMER_DELAY_MS}`
    );
  }
  const fileExpiresAfterSeconds = config.fileExpiresAfterSeconds ?? DEFAULT_FILE_EXPIRY_SECONDS;
  if (!Number.isSafeInteger(fileExpiresAfterSeconds) || fileExpiresAfterSeconds < 3600 || fileExpiresAfterSeconds > 2592e3) {
    throw new Error("llm-deepseek: fileExpiresAfterSeconds must be an integer from 3600 through 2592000");
  }
  const fileRefreshMarginSeconds = config.fileRefreshMarginSeconds ?? DEFAULT_FILE_REFRESH_MARGIN_SECONDS;
  if (!Number.isSafeInteger(fileRefreshMarginSeconds) || fileRefreshMarginSeconds < 0 || fileRefreshMarginSeconds >= fileExpiresAfterSeconds) {
    throw new Error("llm-deepseek: fileRefreshMarginSeconds must be a non-negative integer below fileExpiresAfterSeconds");
  }
  const fileQuotaCleanupBatch = config.fileQuotaCleanupBatch ?? DEFAULT_FILE_QUOTA_CLEANUP_BATCH;
  if (!Number.isSafeInteger(fileQuotaCleanupBatch) || fileQuotaCleanupBatch < 1 || fileQuotaCleanupBatch > 1e3) {
    throw new Error("llm-deepseek: fileQuotaCleanupBatch must be an integer from 1 through 1000");
  }
  const baseURL = config.baseURL ?? environment?.get(BASE_URL_ENV)?.value ?? PUBLIC_BASE_URL;
  const parsed = new URL(baseURL);
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error("llm-deepseek: Messages baseURL must be an HTTP(S) root without credentials, query, or fragment");
  }
  return {
    baseURL,
    defaults: {
      thinking: config.thinking,
      reasoningEffort: config.reasoningEffort
    },
    maxTokens: config.maxTokens ?? DEFAULT_MAX_TOKENS,
    defaultContextWindow: config.defaultContextWindow ?? DEFAULT_CONTEXT_WINDOW,
    models: resolveModels(config.models),
    streamIdleTimeoutMs,
    maxRequestFilesBytes,
    maxInlineRequestImageBytes,
    maxImagesPerRequest,
    imageOffloadByteQuantum,
    inlineImageOffloadByteQuantum,
    imageOffloadCountQuantum,
    filesApiTimeoutMs,
    filePolicy: {
      expiresAfterSeconds: fileExpiresAfterSeconds,
      refreshMarginSeconds: fileRefreshMarginSeconds,
      quotaCleanupBatch: fileQuotaCleanupBatch
    },
    retryPolicy: resolveRetryPolicy(config.retryPolicy, "llm-deepseek: retryPolicy")
  };
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/model-info.ts
var OFF_REASONING_EFFORT = ReasoningEffortId("off");
var LOW_REASONING_EFFORT = ReasoningEffortId("low");
var HIGH_REASONING_EFFORT = ReasoningEffortId("high");
var MAX_REASONING_EFFORT = ReasoningEffortId("max");
var REASONING_EFFORTS = [
  {
    id: OFF_REASONING_EFFORT,
    name: "Off",
    description: "Use for simple tasks that do not need reasoning."
  },
  {
    id: LOW_REASONING_EFFORT,
    name: "Low",
    description: "Prefer for routine or latency-sensitive tasks."
  },
  {
    id: HIGH_REASONING_EFFORT,
    name: "High",
    description: "The default balance for most tasks."
  },
  {
    id: MAX_REASONING_EFFORT,
    name: "Max",
    description: "Reserve for the hardest quality-first tasks."
  }
];
var OFF_ONLY_REASONING_EFFORTS = [
  {
    id: OFF_REASONING_EFFORT,
    name: "Off",
    description: "Use for simple tasks that do not need reasoning."
  }
];
function catalogModelInfo(provider, model, badge) {
  return {
    provider,
    id: model.id,
    name: model.name ?? model.id,
    ...model.description === void 0 ? {} : { description: model.description },
    inputModalities: model.inputModalities ?? ["text"],
    ...badge === void 0 ? {} : { badge }
  };
}
function modelInfo(connection, provider, model) {
  const configured = connection.models.find((entry) => entry.id === model);
  const contextWindow = configured?.contextWindow ?? connection.defaultContextWindow;
  return {
    // An uncatalogued endpoint is safely treated as text-only. Declaring an
    // unverified image capability would let the host persist input that the
    // endpoint may reject on every later turn.
    ...configured === void 0 ? { provider, id: model, name: model, inputModalities: ["text"] } : catalogModelInfo(provider, configured),
    context: { contextWindow },
    defaultMaxTokens: configured?.maxTokens ?? connection.maxTokens,
    ...configured?.systemPromptUpdate === void 0 ? {} : { systemPromptUpdate: configured.systemPromptUpdate },
    ...configured?.toolUpdate === void 0 ? {} : { toolUpdate: configured.toolUpdate },
    ...connection.defaults.thinking === "disabled" ? {
      reasoning: {
        efforts: OFF_ONLY_REASONING_EFFORTS,
        defaultEffort: OFF_REASONING_EFFORT
      }
    } : {
      reasoning: {
        efforts: REASONING_EFFORTS,
        defaultEffort: connection.defaults.reasoningEffort === "off" ? OFF_REASONING_EFFORT : connection.defaults.reasoningEffort === "low" ? LOW_REASONING_EFFORT : connection.defaults.reasoningEffort === "max" ? MAX_REASONING_EFFORT : HIGH_REASONING_EFFORT
      }
    }
  };
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/file-id.ts
function DeepSeekFileId(id) {
  return id;
}
function DeepSeekFileScope(scope) {
  return scope;
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/messages-api.ts
var MESSAGES_FILES_BETA = "files-api-2025-04-14";
var MESSAGES_TOOL_CHANGES_BETA = "mid-conversation-tool-changes-2026-07-01";
function messagesApiRoot(baseURL) {
  const base = baseURL.replace(/\/+$/u, "");
  return new URL(base).pathname.endsWith("/v1") ? base : `${base}/v1`;
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/files-api.ts
var MIN_FILE_EXPIRY_SECONDS = 3600;
var MAX_FILE_EXPIRY_SECONDS = 2592e3;
var MAX_FILE_UPLOAD_BYTES = 128 * 1024 * 1024;
var MAX_STORED_FILE_BYTES = 25 * 1024 * 1024 * 1024;
var DeepSeekFilesError = class extends LlmError {
  /** Parsed provider detail used only for error classification. */
  detail;
  /**
   * @param message - user-readable provider failure.
   * @param status - HTTP status returned by the Files API.
   * @param detail - provider error fields joined for classification.
   */
  constructor(message, status, detail) {
    super(message, status === 401 || status === 403 ? "AUTH" : status === 429 ? "RATE_LIMIT" : status >= 500 ? "SERVER" : "FILES_API", { status });
    this.name = "DeepSeekFilesError";
    this.detail = detail;
  }
};
function isFilesQuotaError(error) {
  return error instanceof DeepSeekFilesError && /(?:quota|storage|stored files|file count|too many files)/iu.test(error.detail);
}
function invalidResponse(operation) {
  return new LlmError(`DeepSeek Files API returned an invalid ${operation} response.`, "INVALID_RESPONSE");
}
async function responseJson(response, operation) {
  try {
    return await response.json();
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    throw new LlmError(`DeepSeek Files API returned invalid JSON for ${operation} (HTTP ${response.status}).`, "INVALID_RESPONSE", {
      status: response.status,
      cause: error
    });
  }
}
function parseFileObject(value, operation) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw invalidResponse(operation);
  const wire = value;
  const createdAt = typeof wire.created_at === "string" ? Math.floor(Date.parse(wire.created_at) / 1e3) : NaN;
  if (typeof wire.id !== "string" || wire.id.length === 0 || wire.type !== "file" || typeof wire.mime_type !== "string" || typeof wire.size_bytes !== "number" || !Number.isSafeInteger(wire.size_bytes) || wire.size_bytes < 0 || !Number.isSafeInteger(createdAt) || createdAt < 0 || typeof wire.filename !== "string" || wire.filename.length === 0) {
    throw invalidResponse(operation);
  }
  return {
    id: DeepSeekFileId(wire.id),
    bytes: wire.size_bytes,
    createdAt,
    filename: wire.filename
  };
}
function providerErrorDetail(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return { detail: "" };
  const error = value.error;
  if (error === null || typeof error !== "object" || Array.isArray(error)) return { detail: "" };
  const fields = error;
  const message = typeof fields.message === "string" ? fields.message : void 0;
  return {
    ...message === void 0 ? {} : { message },
    detail: [fields.code, fields.type, fields.message].filter((field) => typeof field === "string").join(" ")
  };
}
var DeepSeekFilesClient = class {
  baseURL;
  authHeaders;
  fetchImpl;
  /**
   * @param options - endpoint, authentication headers, and optional test transport.
   */
  constructor(options) {
    this.authHeaders = options.headers;
    this.fetchImpl = options.fetch ?? globalThis.fetch;
    this.baseURL = messagesApiRoot(options.baseURL);
  }
  async request(path, init, signal) {
    let response;
    try {
      const headers = new Headers(attributionHeaders());
      for (const [name, value] of Object.entries(this.authHeaders)) headers.set(name, value);
      headers.set("anthropic-version", "2023-06-01");
      headers.set("anthropic-beta", MESSAGES_FILES_BETA);
      response = await this.fetchImpl(`${this.baseURL}${path}`, {
        ...init,
        redirect: "error",
        headers,
        ...signal === void 0 ? {} : { signal }
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new LlmError(`DeepSeek Files API request to ${this.baseURL} failed`, "TRANSPORT", { cause: error });
    }
    if (response.ok) return response;
    let parsed;
    try {
      parsed = await response.json();
    } catch {
    }
    const { message, detail } = providerErrorDetail(parsed);
    throw new DeepSeekFilesError(
      message ?? `DeepSeek Files API error (HTTP ${response.status})`,
      response.status,
      detail
    );
  }
  /**
   * Upload one image with an explicit expiry.
   * @param input - deterministic request-version bytes, media type, filename, lifetime, and cancellation.
   * @returns the validated file and reuse deadline. Messages omits expiry metadata;
   *   its deadline uses upload creation plus the requested lifetime.
   */
  async upload(input) {
    if (input.data.byteLength > MAX_FILE_UPLOAD_BYTES) {
      throw new LlmError("DeepSeek Files API upload exceeds 128 MiB.", "INVALID_REQUEST");
    }
    if (!Number.isSafeInteger(input.expiresAfterSeconds) || input.expiresAfterSeconds < MIN_FILE_EXPIRY_SECONDS || input.expiresAfterSeconds > MAX_FILE_EXPIRY_SECONDS) {
      throw new LlmError("DeepSeek file expiry must be between 3600 and 2592000 seconds.", "INVALID_REQUEST");
    }
    const form = new FormData();
    form.set("expires_after[anchor]", "created_at");
    form.set("expires_after[seconds]", String(input.expiresAfterSeconds));
    form.set("file", new Blob([Uint8Array.from(input.data).buffer], { type: input.mediaType }), input.filename);
    const response = await this.request("/files", { method: "POST", body: form }, input.signal);
    const file = parseFileObject(await responseJson(response, "upload"), "upload");
    return { ...file, expiresAt: file.createdAt + input.expiresAfterSeconds };
  }
  /**
   * List one provider-ordered page of files.
   * @param options - pagination and cancellation.
   * @returns the validated page with null cursors omitted.
   */
  async list(options = {}) {
    const query = new URLSearchParams();
    if (options.after !== void 0) query.set("after_id", options.after);
    if (options.limit !== void 0) query.set("limit", String(options.limit));
    const response = await this.request(`/files?${query.toString()}`, { method: "GET" }, options.signal);
    const value = await responseJson(response, "list");
    if (value === null || typeof value !== "object" || Array.isArray(value)) throw invalidResponse("list");
    const wire = value;
    const firstId = wire.first_id ?? void 0;
    const lastId = wire.last_id ?? void 0;
    if (!Array.isArray(wire.data) || typeof wire.has_more !== "boolean" || firstId !== void 0 && typeof firstId !== "string" || lastId !== void 0 && typeof lastId !== "string") {
      throw invalidResponse("list");
    }
    return {
      data: wire.data.map((item) => parseFileObject(item, "list")),
      ...typeof firstId === "string" ? { firstId: DeepSeekFileId(firstId) } : {},
      ...typeof lastId === "string" ? { lastId: DeepSeekFileId(lastId) } : {},
      hasMore: wire.has_more
    };
  }
  /**
   * Retrieve one file object.
   * @param fileId - provider file identifier.
   * @param signal - request cancellation.
   * @returns the validated file object.
   */
  async retrieve(fileId, signal) {
    const response = await this.request(`/files/${encodeURIComponent(fileId)}`, { method: "GET" }, signal);
    return parseFileObject(await responseJson(response, "retrieve"), "retrieve");
  }
  /**
   * Delete one provider file.
   * @param fileId - provider file identifier.
   * @param signal - request cancellation.
   */
  async delete(fileId, signal) {
    const response = await this.request(`/files/${encodeURIComponent(fileId)}`, { method: "DELETE" }, signal);
    const value = await responseJson(response, "delete");
    if (value === null || typeof value !== "object" || Array.isArray(value)) throw invalidResponse("delete");
    const wire = value;
    if (wire.id !== fileId || wire.type !== "file_deleted") throw invalidResponse("delete");
  }
};

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/upload-index.ts
import { createHash as createHash2 } from "node:crypto";
import { readFile as readFile2, mkdir as mkdir2 } from "node:fs/promises";
import { dirname as dirname3, join as join2 } from "node:path";

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/util/atomic-write/src/index.ts
import { createHash, randomBytes } from "node:crypto";
import { lstat, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { setTimeout as wait } from "node:timers/promises";
var WINDOWS_TRANSIENT_RENAME_ERRORS = /* @__PURE__ */ new Set(["EACCES", "EBUSY", "EPERM"]);
var WINDOWS_RENAME_RETRY_INITIAL_MS = 20;
var WINDOWS_RENAME_RETRY_MAX_MS = 200;
var WINDOWS_RENAME_RETRY_LIMIT = 8;
function isTransientWindowsRenameError(error) {
  if (process.platform !== "win32") return false;
  return WINDOWS_TRANSIENT_RENAME_ERRORS.has(error?.code ?? "");
}
async function renameAtomicTemp(temp, filename2) {
  let delay = WINDOWS_RENAME_RETRY_INITIAL_MS;
  for (let retries = 0; ; retries += 1) {
    try {
      await rename(temp, filename2);
      return;
    } catch (error) {
      if (!isTransientWindowsRenameError(error)) throw error;
      if (retries >= WINDOWS_RENAME_RETRY_LIMIT) throw error;
    }
    await new Promise((resolve3) => setTimeout(resolve3, delay));
    delay = Math.min(delay * 2, WINDOWS_RENAME_RETRY_MAX_MS);
  }
}
async function writeFileAtomic(filename2, content, options) {
  await mkdir(dirname(filename2), {
    recursive: true,
    ...options.dirMode === void 0 ? {} : { mode: options.dirMode }
  });
  const temp = `${filename2}.${randomBytes(6).toString("hex")}.tmp`;
  try {
    await writeFile(temp, content, { mode: options.mode, flag: "wx" });
    await renameAtomicTemp(temp, filename2);
  } catch (error) {
    await rm(temp, { force: true });
    throw error;
  }
}
async function isLockContention(error, lockPath) {
  const code = error?.code;
  if (code === "EEXIST") return true;
  if (code !== "EPERM") return false;
  try {
    await lstat(lockPath);
    return true;
  } catch {
    return false;
  }
}
function holderExited(record) {
  if (!/^\d+\n$/.test(record)) return false;
  const pid = Number(record.trim());
  if (pid === 0 || pid > 2147483647) return false;
  if (pid === process.pid) return false;
  try {
    process.kill(pid, 0);
    return false;
  } catch (error) {
    return error.code === "ESRCH";
  }
}
async function readLockRecord(lockPath) {
  try {
    return await readFile(lockPath, "utf8");
  } catch (error) {
    void error;
    return void 0;
  }
}
async function takeOverExitedLock(lockPath) {
  const record = await readLockRecord(lockPath);
  if (record === void 0 || !holderExited(record)) return false;
  const claim = `${lockPath}.takeover-${createHash("sha256").update(record).digest("hex").slice(0, 16)}`;
  try {
    await writeFile(claim, `${process.pid}
`, { mode: 384, flag: "wx" });
  } catch (error) {
    const code = error.code;
    if (code === "EEXIST" || code === "EPERM") return false;
    throw error;
  }
  try {
    if (await readLockRecord(lockPath) !== record || !holderExited(record)) return false;
    try {
      await rm(lockPath, { force: true });
    } catch (error) {
      void error;
      return false;
    }
    return true;
  } finally {
    await rm(claim, { force: true }).catch((error) => {
      void error;
    });
  }
}
var LOCK_RETRY_INITIAL_MS = 20;
var LOCK_RETRY_MAX_MS = 200;
var DEFAULT_LOCK_WAIT_MS = 2e3;
async function withFileLock(filename2, operation, options) {
  const lockPath = `${filename2}.lock`;
  const deadline2 = Date.now() + (options?.waitMs ?? DEFAULT_LOCK_WAIT_MS);
  let delay = LOCK_RETRY_INITIAL_MS;
  let retriedUnconfirmedPermissionError = false;
  for (; ; ) {
    options?.signal?.throwIfAborted();
    try {
      await writeFile(lockPath, `${process.pid}
`, { mode: 384, flag: "wx" });
      break;
    } catch (error) {
      if (!await isLockContention(error, lockPath)) {
        if (process.platform !== "win32" || error?.code !== "EPERM" || retriedUnconfirmedPermissionError) throw error;
        retriedUnconfirmedPermissionError = true;
      } else if (await takeOverExitedLock(lockPath)) continue;
    }
    if (Date.now() >= deadline2) {
      throw new Error(`atomic-write: timed out waiting for the writer lock at ${lockPath}`);
    }
    await wait(delay, void 0, { signal: options?.signal });
    delay = Math.min(delay * 2, LOCK_RETRY_MAX_MS);
  }
  try {
    options?.signal?.throwIfAborted();
    return await operation();
  } finally {
    await rm(lockPath, { force: true });
  }
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/util/home-paths/src/index.ts
import { opendir, realpath } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname as dirname2, join, resolve as resolve2 } from "node:path";
var DSH_HOME_DIR_NAME = ".dsh";
var DEFAULT_DSH_HOME_DISPLAY = `~/${DSH_HOME_DIR_NAME}`;
var DSH_HOME_ENV = "DSH_HOME";
var AGENTS_HOME_DIR_NAME = ".agents";
var DEFAULT_AGENTS_HOME_DISPLAY = `~/${AGENTS_HOME_DIR_NAME}`;
function defaultDshHome() {
  return join(homedir(), DSH_HOME_DIR_NAME);
}
function expandHomePath(path) {
  if (path === "~") return homedir();
  if (path.startsWith("~/") || path.startsWith("~\\")) return join(homedir(), path.slice(2));
  return path;
}
function resolveRoot(configured, env, envName, fallback) {
  const fromEnv = env[envName];
  const selected = configured ?? (fromEnv !== void 0 && fromEnv.trim().length > 0 ? fromEnv : fallback());
  return resolve2(expandHomePath(selected));
}
function resolveDshHome(configured, env = process.env) {
  return resolveRoot(configured, env, DSH_HOME_ENV, defaultDshHome);
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/upload-index.ts
var InvalidUploadIndexError = class extends Error {
};
function deepSeekFileScope(baseURL, credentials) {
  const digest = createHash2("sha256").update(baseURL.replace(/\/+$/u, "")).update("\0").update(credentials).digest("hex");
  return DeepSeekFileScope(digest);
}
function absent(error) {
  return error?.code === "ENOENT";
}
function parseRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new InvalidUploadIndexError("llm-deepseek: upload index contains a non-object record");
  }
  const record = value;
  if (typeof record.scope !== "string" || !/^[0-9a-f]{64}$/u.test(record.scope) || typeof record.attachmentId !== "string" || !/^sha256:[0-9a-f]{64}$/u.test(record.attachmentId) || typeof record.variantId !== "string" || !/^sha256:[0-9a-f]{64}$/u.test(record.variantId) || typeof record.fileId !== "string" || record.fileId.length === 0 || !Number.isSafeInteger(record.bytes) || record.bytes < 0 || !Number.isSafeInteger(record.createdAt) || record.createdAt < 0 || !Number.isSafeInteger(record.expiresAt) || record.expiresAt < 0) {
    throw new InvalidUploadIndexError("llm-deepseek: upload index contains an invalid record");
  }
  return {
    scope: DeepSeekFileScope(record.scope),
    attachmentId: record.attachmentId,
    variantId: ImageVariantId(record.variantId),
    fileId: DeepSeekFileId(record.fileId),
    bytes: record.bytes,
    createdAt: record.createdAt,
    expiresAt: record.expiresAt
  };
}
function parseIndex(text) {
  let value;
  try {
    value = JSON.parse(text);
  } catch (error) {
    throw new InvalidUploadIndexError("llm-deepseek: upload index is not valid JSON", { cause: error });
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new InvalidUploadIndexError("llm-deepseek: upload index is not an object");
  }
  const index = value;
  if (index.formatVersion !== 3 || !Array.isArray(index.records)) {
    throw new InvalidUploadIndexError("llm-deepseek: unsupported upload index format");
  }
  const records = index.records.map(parseRecord);
  const keys = /* @__PURE__ */ new Set();
  for (const record of records) {
    const key = `${record.scope}\0${record.variantId}`;
    if (keys.has(key)) throw new InvalidUploadIndexError("llm-deepseek: upload index contains duplicate mappings");
    keys.add(key);
  }
  return { formatVersion: 3, records };
}
function reusable(record, now, refreshMarginMs) {
  return record.expiresAt - now > refreshMarginMs;
}
var DeepSeekUploadIndex = class {
  /** Absolute owner-private JSON index path. */
  path;
  /**
   * @param path - explicit test path; omission uses `DSH_HOME/llm-deepseek/files-v3.json`.
   */
  constructor(path = join2(resolveDshHome(), "llm-deepseek", "files-v3.json")) {
    this.path = path;
  }
  async load() {
    try {
      return parseIndex(await readFile2(this.path, "utf8"));
    } catch (error) {
      if (absent(error) || error instanceof InvalidUploadIndexError) {
        return { formatVersion: 3, records: [] };
      }
      throw error;
    }
  }
  async save(index) {
    await writeFileAtomic(this.path, `${JSON.stringify(index, void 0, 2)}
`, {
      mode: 384,
      dirMode: 448
    });
  }
  /**
   * Read one reusable mapping.
   * @param scope - endpoint/API-key namespace.
   * @param variantId - complete request-image transformation identity.
   * @param now - current Unix time in milliseconds.
   * @param refreshMarginMs - remaining lifetime below which a mapping is not reused.
   * @returns the mapping when it has enough lifetime remaining.
   */
  async get(scope, variantId, now, refreshMarginMs) {
    const record = (await this.load()).records.find((candidate) => candidate.scope === scope && candidate.variantId === variantId);
    return record !== void 0 && reusable(record, now, refreshMarginMs) ? record : void 0;
  }
  /**
   * Publish a completed upload unless another process already published a reusable mapping.
   * @param candidate - completed remote upload.
   * @param now - current Unix time in milliseconds.
   * @param refreshMarginMs - minimum reusable remaining lifetime.
   * @returns the winning record and whether the candidate entered the index.
   */
  async commit(candidate, now, refreshMarginMs) {
    await mkdir2(dirname3(this.path), { recursive: true, mode: 448 });
    return withFileLock(this.path, async () => {
      const index = await this.load();
      const existing = index.records.find((record) => record.scope === candidate.scope && record.variantId === candidate.variantId && reusable(record, now, refreshMarginMs));
      if (existing !== void 0) return { record: existing, accepted: false };
      const records = index.records.filter((record) => reusable(record, now, refreshMarginMs) && !(record.scope === candidate.scope && record.variantId === candidate.variantId));
      records.push(candidate);
      await this.save({ formatVersion: 3, records });
      return { record: candidate, accepted: true };
    });
  }
  /**
   * Remove exact mappings in one locked rewrite without deleting concurrently installed successors.
   * @param scope - endpoint/API-key namespace.
   * @param generations - exact remote generations being invalidated; pairs absent from the index are ignored.
   */
  async remove(scope, generations) {
    const invalidated = new Set(generations.map((generation) => `${generation.variantId}\0${generation.fileId}`));
    await mkdir2(dirname3(this.path), { recursive: true, mode: 448 });
    await withFileLock(this.path, async () => {
      const index = await this.load();
      const records = index.records.filter((record) => !(record.scope === scope && invalidated.has(`${record.variantId}\0${record.fileId}`)));
      if (records.length !== index.records.length) await this.save({ formatVersion: 3, records });
    });
  }
  /**
   * Remove every local mapping for one remote namespace.
   * @param scope - endpoint/API-key namespace.
   */
  async clear(scope) {
    await mkdir2(dirname3(this.path), { recursive: true, mode: 448 });
    await withFileLock(this.path, async () => {
      const index = await this.load();
      const records = index.records.filter((record) => record.scope !== scope);
      if (records.length !== index.records.length) await this.save({ formatVersion: 3, records });
    });
  }
};

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/file-store.ts
var MAX_IMAGE_BYTES = 32 * 1024 * 1024;
var OWNED_FILE_PREFIX = "dsh-";
function fileScope(connection) {
  return deepSeekFileScope(
    messagesApiRoot(connection.baseURL),
    JSON.stringify(Object.entries(connection.headers).sort(([left], [right]) => left.localeCompare(right)))
  );
}
function abortReason(signal) {
  const reason = signal.reason;
  return reason instanceof Error ? reason : new Error("DeepSeek file upload cancelled with a non-Error reason.", { cause: reason });
}
function uploadFailure(error) {
  return error instanceof Error ? error : new Error("DeepSeek file upload failed with a non-Error reason.", { cause: error });
}
function waitForUpload(operation, signal) {
  signal?.throwIfAborted();
  operation.waiters += 1;
  let released = false;
  const release = (cancelledReason) => {
    if (released) return;
    released = true;
    operation.waiters -= 1;
    if (cancelledReason !== void 0 && operation.waiters === 0 && !operation.settled) {
      operation.controller.abort(cancelledReason);
    }
  };
  if (signal === void 0) {
    return operation.promise.finally(() => {
      release();
    });
  }
  return new Promise((resolve3, reject) => {
    const abort = () => {
      const reason = abortReason(signal);
      release(reason);
      reject(reason);
    };
    signal.addEventListener("abort", abort, { once: true });
    void operation.promise.then((value) => {
      signal.removeEventListener("abort", abort);
      release();
      resolve3(value);
    }, (error) => {
      signal.removeEventListener("abort", abort);
      release();
      reject(uploadFailure(error));
    });
  });
}
function extension2(mediaType) {
  switch (mediaType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpeg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
  }
}
function filename(version2) {
  const attachment = String(version2.attachment.attachmentId).slice("sha256:".length, "sha256:".length + 16);
  const variant = String(version2.variantId).slice("sha256:".length, "sha256:".length + 8);
  return `${OWNED_FILE_PREFIX}${attachment}-${variant}.${extension2(version2.mediaType)}`;
}
var DeepSeekFileStore = class {
  index;
  now;
  fetchImpl;
  inflight = /* @__PURE__ */ new Map();
  /**
   * @param options - testable index, clock, and transport boundaries.
   */
  constructor(options = {}) {
    this.index = options.index ?? new DeepSeekUploadIndex();
    this.now = options.now ?? Date.now;
    this.fetchImpl = options.fetch;
  }
  client(connection) {
    return new DeepSeekFilesClient({
      baseURL: connection.baseURL,
      headers: connection.headers,
      ...this.fetchImpl === void 0 ? {} : { fetch: this.fetchImpl }
    });
  }
  /**
   * Resolve or upload one deterministic request image. Concurrent calls share one upload while retaining independent waits.
   * @param version - deterministic model-request bytes and complete transformation identity.
   * @param connection - endpoint and API-key snapshot.
   * @param policy - expiry and quota-recovery policy.
   * @param signal - cancellation of this wait; shared transport stops when no waiter remains.
   * @returns a reusable file id and whether this call published a new upload.
   */
  ensureUploaded(version2, connection, policy, signal) {
    signal?.throwIfAborted();
    const scope = fileScope(connection);
    const key = `${scope}\0${version2.variantId}`;
    let active = this.inflight.get(key);
    if (active?.controller.signal.aborted) {
      this.inflight.delete(key);
      active = void 0;
    }
    if (active !== void 0) return waitForUpload(active, signal);
    const controller = new AbortController();
    const shared = {
      controller,
      settled: false,
      waiters: 0,
      promise: void 0
    };
    shared.promise = this.ensureUploadedOnce(version2, connection, policy, controller.signal).then((value) => {
      shared.settled = true;
      return value;
    }, (error) => {
      shared.settled = true;
      throw uploadFailure(error);
    });
    this.inflight.set(key, shared);
    void shared.promise.finally(() => {
      if (this.inflight.get(key) === shared) this.inflight.delete(key);
    }).catch(() => {
    });
    return waitForUpload(shared, signal);
  }
  async ensureUploadedOnce(version2, connection, policy, signal) {
    if (version2.bytes > MAX_IMAGE_BYTES) {
      throw new LlmError("DeepSeek image exceeds the 32 MiB per-image limit.", "INVALID_REQUEST");
    }
    const scope = fileScope(connection);
    const now = this.now();
    const marginMs = policy.refreshMarginSeconds * 1e3;
    const cached = await this.index.get(scope, version2.variantId, now, marginMs);
    if (cached !== void 0) return { record: cached, uploaded: false };
    const client = this.client(connection);
    const upload = async () => {
      const remote = await client.upload({
        data: version2.data,
        mediaType: version2.mediaType,
        filename: filename(version2),
        expiresAfterSeconds: policy.expiresAfterSeconds,
        signal
      });
      if (remote.bytes !== version2.data.byteLength) {
        throw new LlmError("DeepSeek Files API upload response does not match the submitted image.", "INVALID_RESPONSE");
      }
      return {
        scope,
        attachmentId: version2.attachment.attachmentId,
        variantId: version2.variantId,
        fileId: remote.id,
        bytes: remote.bytes,
        createdAt: remote.createdAt * 1e3,
        expiresAt: remote.expiresAt * 1e3
      };
    };
    let candidate;
    try {
      candidate = await upload();
    } catch (error) {
      if (!isFilesQuotaError(error)) throw error;
      const deleted = await this.reclaimOldestOwned(connection, policy.quotaCleanupBatch, signal);
      if (deleted === 0) throw error;
      candidate = await upload();
    }
    const committed = await this.index.commit(candidate, this.now(), marginMs);
    if (!committed.accepted) {
      try {
        await client.delete(candidate.fileId, signal);
      } catch {
      }
    }
    return { record: committed.record, uploaded: committed.accepted };
  }
  /**
   * Invalidate exact local mappings in one index update after a model request rejects their remote ids.
   * @param generations - request-image variants with the exact file id the request used for each.
   * @param connection - endpoint and API-key snapshot.
   */
  async invalidate(generations, connection) {
    await this.index.remove(fileScope(connection), generations);
  }
  /**
   * Delete the indexed remote file for one attachment and remove its local mapping.
   * @param version - exact request-image version to release.
   * @param connection - endpoint and API-key snapshot.
   * @param policy - expiry policy used to locate a reusable mapping.
   * @param signal - request cancellation.
   * @returns whether an indexed file existed and was deleted.
   */
  async release(version2, connection, policy, signal) {
    const scope = fileScope(connection);
    const record = await this.index.get(
      scope,
      version2.variantId,
      this.now(),
      policy.refreshMarginSeconds * 1e3
    );
    if (record === void 0) return false;
    await this.client(connection).delete(record.fileId, signal);
    await this.index.remove(scope, [{ variantId: version2.variantId, fileId: record.fileId }]);
    return true;
  }
  /**
   * Delete the oldest provider files whose names identify harness ownership.
   * @param connection - endpoint and API-key snapshot.
   * @param count - positive maximum number of files to delete.
   * @param signal - request cancellation.
   * @returns number of successfully deleted files.
   */
  async reclaimOldestOwned(connection, count, signal) {
    const client = this.client(connection);
    let after;
    const owned = [];
    while (true) {
      const page = await client.list({
        ...after === void 0 ? {} : { after },
        limit: 1e3,
        ...signal === void 0 ? {} : { signal }
      });
      for (const file of page.data) {
        if (!file.filename.startsWith(OWNED_FILE_PREFIX)) continue;
        owned.push({ id: file.id, createdAt: file.createdAt });
      }
      owned.sort((left, right) => left.createdAt - right.createdAt);
      owned.splice(count);
      if (!page.hasMore || page.lastId === void 0 || page.lastId === after) break;
      after = page.lastId;
    }
    for (const file of owned) await client.delete(file.id, signal);
    return owned.length;
  }
  /**
   * Delete every remote harness-owned file in the active API-key namespace and clear its index.
   * @param connection - endpoint and API-key snapshot.
   * @param signal - request cancellation.
   * @returns number of deleted files.
   */
  async releaseAll(connection, signal) {
    let total = 0;
    for (; ; ) {
      const deleted = await this.reclaimOldestOwned(connection, 1e3, signal);
      total += deleted;
      if (deleted < 1e3) break;
    }
    await this.index.clear(fileScope(connection));
    return total;
  }
};

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/request-files.ts
var FileResolutionFailure = class extends Error {
  constructor(cause) {
    super("DeepSeek Files API could not resolve a request image.", { cause });
    this.name = "FileResolutionFailure";
  }
};
function providerRejectedNormalizedImage(detail) {
  const reasonBeforeImage = /(?:unsupported|invalid|cannot read|failed to (?:decode|process)).{0,40}image/iu;
  const imageBeforeReason = /image.{0,40}(?:unsupported|invalid|cannot be decoded)/iu;
  return reasonBeforeImage.test(detail) || imageBeforeReason.test(detail);
}
function providerRejectedFileId(detail) {
  const file = /\bfile(?:[_ -]?(?:id|api|not[_ -]?found|deleted|expired))?/iu.test(detail);
  const missing = /(?:expired|not[_ -]?found|deleted|do(?:es)? not exist|not created under (?:this|your) account)/iu.test(detail);
  const invalidId = /(?:invalid.{0,20}file[_ -]?(?:id|api)|file[_ -]?(?:id|api).{0,20}invalid)/iu.test(detail);
  return file && (missing || invalidId);
}
function detailNamesFileId(detail, fileId) {
  let index = detail.indexOf(fileId);
  while (index >= 0) {
    const before = detail[index - 1];
    const after = detail[index + fileId.length];
    if ((before === void 0 || !/[\p{L}\p{N}_-]/u.test(before)) && (after === void 0 || !/[\p{L}\p{N}_-]/u.test(after))) return true;
    index = detail.indexOf(fileId, index + 1);
  }
  return false;
}
function staleMappings(files, detail) {
  const unique = [...new Map(files.map((file) => [`${file.version.variantId}\0${file.fileId}`, file])).values()];
  const exact = unique.filter((file) => detailNamesFileId(detail, file.fileId));
  return exact.length > 0 ? exact : unique;
}
function normalizedImageFacts(file) {
  const version2 = file.version;
  const name = version2.attachment.name ?? version2.attachment.attachmentId;
  const colour = version2.hasAlpha ? "sRGBA" : "sRGB";
  return `"${name}" at message ${file.location.message}, image ${file.location.image} (${version2.mediaType}, 8-bit ${colour}, ${version2.width}x${version2.height})`;
}
function normalizedImageDiagnostic(files, providerMessage, providerDetail) {
  const exact = files.find((file) => detailNamesFileId(providerDetail, file.fileId));
  const target = exact ?? (files.length === 1 ? files[0] : void 0);
  if (target !== void 0) {
    return `DeepSeek rejected normalized image ${normalizedImageFacts(target)}: ${providerMessage}. The provider rejected bytes already normalized by the harness; PNG, JPEG, WebP, and GIF remain supported input formats.`;
  }
  const candidates = [...new Map(files.map((file) => [
    `${file.version.variantId}\0${file.location.message}\0${file.location.image}`,
    file
  ])).values()];
  return `DeepSeek rejected a normalized request image: ${providerMessage}. Candidate images: ${candidates.map(normalizedImageFacts).join("; ")}. The provider rejected bytes already normalized by the harness; PNG, JPEG, WebP, and GIF remain supported input formats.`;
}
var RequestFiles = class {
  constructor(files, connection, policy, timeoutMs, signal, activity) {
    this.files = files;
    this.connection = connection;
    this.policy = policy;
    this.timeoutMs = timeoutMs;
    this.signal = signal;
    this.activity = activity;
  }
  used = [];
  retried = false;
  /** Reset occurrence tracking before serializing the next HTTP attempt. */
  beginAttempt() {
    this.used = [];
  }
  /**
   * Resolve a retained image under its own upload deadline.
   * @param version - prepared request image.
   * @param location - occurrence used by provider-rejection diagnostics.
   * @returns the reusable provider id.
   */
  async resolve(version2, location) {
    var _stack = [];
    try {
      const limit = __using(_stack, deadline(this.signal, this.timeoutMs, "DEEPSEEK_FILES_API_TIMEOUT"));
      let resolved;
      try {
        resolved = await this.files.ensureUploaded(version2, this.connection, this.policy, limit.signal);
      } catch (error) {
        if (this.signal.aborted) throw error;
        throw new FileResolutionFailure(error);
      }
      this.activity();
      this.used.push({ version: version2, fileId: resolved.record.fileId, location });
      return resolved.record.fileId;
    } catch (_) {
      var _error = _, _hasError = true;
    } finally {
      __callDispose(_stack, _error, _hasError);
    }
  }
  /**
   * Invalidate every rejected mapping in one index update; only the first stale-id response permits another request.
   * @param detail - provider error fields used for stale-id classification.
   * @returns whether the caller should serialize and dispatch again.
   */
  async retry(detail) {
    if (this.used.length === 0 || !providerRejectedFileId(detail)) return false;
    await this.files.invalidate(
      staleMappings(this.used, detail).map((file) => ({ variantId: file.version.variantId, fileId: file.fileId })),
      this.connection
    );
    if (this.retried) return false;
    this.retried = true;
    return true;
  }
  /**
   * Attribute a normalized-image rejection to the actual uploaded image occurrences.
   * @param status - rejected request's HTTP status.
   * @param message - provider's error message.
   * @param detail - provider error classification fields.
   * @returns the image diagnostic or the original provider message.
   */
  errorMessage(status, message, detail) {
    return status === 400 && this.used.length > 0 && providerRejectedNormalizedImage(detail) ? normalizedImageDiagnostic(this.used, message, detail) : message;
  }
};

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/request-extensions.ts
async function prepareRequestExtensions(body, options, prepare, onOmitted, onUnaccepted) {
  let extensions;
  try {
    extensions = await prepare({ body, ...options });
  } catch (error) {
    throw new LlmError(`DeepSeek request extension preparation failed: ${errorChain(error)}`, "REQUEST_EXTENSION", { cause: error });
  }
  const fields = Object.keys(extensions.fields);
  for (const field of fields) {
    if (Object.hasOwn(body, field)) {
      throw new LlmError(`DeepSeek request extension field ${JSON.stringify(field)} collides with the base request`, "REQUEST_EXTENSION");
    }
  }
  let payload;
  try {
    payload = JSON.stringify({ ...body, ...extensions.fields });
  } catch (error) {
    const base = JSON.stringify(body);
    onOmitted(fields, error);
    return { payload: base, accept: () => Promise.resolve() };
  }
  return {
    payload,
    async accept() {
      try {
        await extensions.accept();
      } catch (error) {
        onUnaccepted(error);
      }
    }
  };
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/images.ts
function bounds(connection, representation) {
  return {
    representation,
    maxBytes: representation === "raw" ? connection.maxRequestFilesBytes : connection.maxInlineRequestImageBytes,
    maxImages: connection.maxImagesPerRequest,
    byteQuantum: representation === "raw" ? connection.imageOffloadByteQuantum : connection.inlineImageOffloadByteQuantum,
    countQuantum: connection.imageOffloadCountQuantum
  };
}
function* imageRefs(blocks) {
  for (const block of blocks) {
    if (block.type === "image") yield block.attachment;
  }
}
async function prepareImages(history, connection, modelId, attachments, access, signal) {
  const versions = /* @__PURE__ */ new Map();
  const messages = projectOffloadedImages(history, (ref) => offloadedImageText(ref, access(ref)));
  if (!messages.some((message) => contentHasImage(message.content))) return { messages, versions };
  const model = connection.models.find((entry) => entry.id === modelId);
  if (model?.inputModalities?.includes("image") !== true || attachments === void 0) {
    throw new LlmError("DeepSeek Messages image input requires a vision model and attachment service", "UNSUPPORTED_CONTENT");
  }
  if (messages.some((message) => message.role !== "user" && message.role !== "tool" && contentHasImage(message.content))) {
    throw new LlmError("DeepSeek Messages supports images only in user messages and tool results", "UNSUPPORTED_CONTENT");
  }
  for (const message of messages) {
    for (const ref of imageRefs(message.content)) {
      if (!versions.has(ref.attachmentId)) {
        versions.set(ref.attachmentId, await attachments.readImageRequest(ref, resolveRequestImageTarget(model, ref), signal));
      }
    }
  }
  assertImagesFit(messages, versions, connection, "raw");
  return { messages, versions };
}
function inlineImages(messages, versions, connection) {
  assertImagesFit(messages, versions, connection, "base64");
  return messages;
}
function assertImagesFit(messages, versions, connection, representation) {
  const offloadImages = requiredImageOffload(
    messages,
    bounds(connection, representation),
    (block) => versions.get(block.attachment.attachmentId).bytes
  );
  if (offloadImages > 0) {
    throw new LlmError(
      `DeepSeek Messages ${representation} request images exceed the route budget; ${offloadImages} more oldest occurrence(s) must be offloaded.`,
      IMAGE_OFFLOAD_REQUIRED_CODE,
      { offloadImages }
    );
  }
}
async function prepareFileIds(messages, versions, files) {
  const ids = /* @__PURE__ */ new Map();
  for (const [index, message] of messages.entries()) {
    let image = 0;
    for (const ref of imageRefs(message.content)) {
      const version2 = versions.get(ref.attachmentId);
      ids.set(ref.attachmentId, await files.resolve(version2, { message: index + 1, image: ++image }));
    }
  }
  return ids;
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/replay.ts
function object(value, code = "MALFORMED_RESPONSE") {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new LlmError("DeepSeek Messages expected a JSON object", code);
  }
  return value;
}
function replayState(model, blocks) {
  return { response: { kind: "deepseek-messages", version: 1, model }, blocks };
}
function readReplay(message, model, onDegrade) {
  try {
    return validateReplay(message, model);
  } catch (error) {
    if (!(error instanceof LlmError) || error.code !== "INVALID_REPLAY_STATE") throw error;
    onDegrade?.(error.message);
    return void 0;
  }
}
function validateReplay(message, model) {
  if (message.source.kind !== "model" || message.source.replayState === void 0) return void 0;
  const fail = (detail) => {
    throw new LlmError(`DeepSeek Messages replay: ${detail}`, "INVALID_REPLAY_STATE");
  };
  const envelope = object(message.source.replayState, "INVALID_REPLAY_STATE");
  const response = object(envelope.response, "INVALID_REPLAY_STATE");
  if (response.kind !== "deepseek-messages" || response.version !== 1) return fail("unsupported kind or version");
  if (response.model !== message.source.model) return fail("model does not match assistant source model");
  if (!Array.isArray(envelope.blocks) || envelope.blocks.length !== message.content.length) return fail("block count mismatch");
  const blocks = envelope.blocks.map((value, index) => {
    const block = object(value, "INVALID_REPLAY_STATE");
    if (block.type !== message.content[index]?.type || block.type !== "text" && block.type !== "reasoning" && block.type !== "tool-call") return fail("block type mismatch");
    if (block.signature !== void 0 && (block.type !== "reasoning" || typeof block.signature !== "string")) return fail("invalid signature");
    return { type: block.type, ...typeof block.signature === "string" ? { signature: block.signature } : {} };
  });
  return response.model === model ? blocks : void 0;
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/serialize.ts
function unsupported(type) {
  throw new LlmError(`DeepSeek Messages cannot represent ${type}`, "UNSUPPORTED_CONTENT");
}
function toolInput(raw) {
  let value;
  try {
    value = JSON.parse(raw);
  } catch (_invalidToolHistoryJson) {
    return {};
  }
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
}
function assistant(message, model, onReplayDegrade) {
  const replay = readReplay(message, model, onReplayDegrade);
  return message.content.flatMap((block, index) => {
    switch (block.type) {
      case "text":
        return block.text.length === 0 ? [] : { type: "text", text: block.text };
      case "reasoning":
        return {
          type: "thinking",
          thinking: block.text,
          ...replay?.[index]?.signature === void 0 ? {} : { signature: replay[index].signature }
        };
      case "tool-call":
        return { type: "tool_use", id: block.id, name: block.name, input: toolInput(block.arguments) };
      default:
        return unsupported(`assistant content ${block.type}`);
    }
  });
}
function serialize(options, connection, history, images, access, onReplayDegrade, fileIds) {
  const model = connection.models.find((entry) => entry.id === options.model);
  const inHistory = model?.systemPromptUpdate === "in-history";
  const input = (blocks) => blocks.flatMap((block) => {
    if (block.type === "text") return block.text ? [{ type: "text", text: block.text }] : [];
    if (block.type === "reasoning" || block.type === "tool-call") return [];
    if (block.type !== "image") return unsupported(`user/tool-result content ${block.type}`);
    const version2 = images.get(block.attachment.attachmentId);
    if (version2 === void 0) throw new LlmError("DeepSeek Messages request image is missing", "INVALID_REQUEST");
    const fileId = fileIds?.get(block.attachment.attachmentId);
    if (fileIds !== void 0 && fileId === void 0) throw new LlmError("DeepSeek Messages request file id is missing", "INVALID_REQUEST");
    return [
      { type: "text", text: requestImageHandleText(block.attachment, version2, access(block.attachment)) },
      fileId === void 0 ? { type: "image", source: { type: "base64", media_type: version2.mediaType, data: Buffer.from(version2.data).toString("base64") } } : { type: "image", source: { type: "file", file_id: fileId } }
    ];
  });
  const messages = [];
  let historySystem;
  const systemUpdates = [];
  const flushSystemUpdates = () => {
    if (systemUpdates.length === 0) return;
    if (messages.at(-1)?.role !== "user") return unsupported("system update without a preceding user or tool-result turn");
    messages.push(...systemUpdates.splice(0));
  };
  for (const message of history) {
    if (message.role === "developer") {
      const content2 = message.content.flatMap((block) => {
        switch (block.type) {
          case "text":
            return block.text.length === 0 ? [] : [{ type: "text", text: block.text }];
          case "tool-addition":
            return [{ type: "tool_addition", tool: { type: "tool_reference", name: block.toolName } }];
          case "tool-removal":
            return [{ type: "tool_removal", tool: { type: "tool_reference", name: block.toolName } }];
          default:
            return unsupported(`developer content ${block.type}`);
        }
      });
      if (content2.length > 0) systemUpdates.push({ role: "system", content: content2 });
      continue;
    }
    if (message.content.some((block) => block.type === "tool-addition" || block.type === "tool-removal")) {
      return unsupported("tool-change blocks outside developer messages");
    }
    if (message.role === "system") {
      const texts = message.content.filter((block) => block.type === "text");
      if (texts.length !== message.content.length) return unsupported("non-text system message");
      const text = texts.map((block) => block.text).join("");
      if (inHistory && messages.length > 0) {
        if (text.length === 0) return unsupported("empty in-history system update");
        systemUpdates.push({ role: "system", content: [{ type: "text", text }] });
      } else {
        historySystem = text;
      }
      continue;
    }
    const content = message.role === "assistant" ? assistant(message, options.model, onReplayDegrade) : message.role === "tool" ? [{ type: "tool_result", tool_use_id: message.toolCallId, content: input(message.content), ...message.isError === void 0 ? {} : { is_error: message.isError } }] : message.content.flatMap((block) => input([block]));
    if ((message.role === "user" || message.role === "assistant") && content.length === 0) continue;
    if (message.role === "assistant") flushSystemUpdates();
    const wireRole = message.role === "tool" ? "user" : message.role;
    const previous = messages.at(-1);
    if (previous?.role === wireRole) previous.content.push(...content);
    else messages.push({ role: wireRole, content });
  }
  flushSystemUpdates();
  let pending = /* @__PURE__ */ new Set();
  for (const message of messages) {
    if (message.role === "assistant") {
      const calls = message.content.filter((block) => block.type === "tool_use");
      pending = new Set(calls.map((block) => block.id));
      if (pending.size !== calls.length) throw new LlmError("DeepSeek Messages duplicate tool call id", "INVALID_REQUEST");
    } else if (message.role === "user") {
      const results = message.content.filter((block) => block.type === "tool_result");
      for (const result of results) {
        if (!pending.delete(result.tool_use_id)) throw new LlmError("DeepSeek Messages tool result has no matching call", "INVALID_REQUEST");
      }
      if (pending.size > 0) throw new LlmError("DeepSeek Messages tool calls need immediate results", "INVALID_REQUEST");
      message.content = [...results, ...message.content.filter((block) => block.type !== "tool_result")];
    }
  }
  if (pending.size > 0) throw new LlmError("DeepSeek Messages history ends with unresolved tools", "INVALID_REQUEST");
  const effort = options.reasoningEffort ?? (connection.defaults.reasoningEffort ?? (connection.defaults.thinking === "disabled" ? "off" : "high"));
  if (!["off", "low", "high", "max"].includes(effort) || connection.defaults.thinking === "disabled" && effort !== "off") {
    throw new LlmError(`DeepSeek Messages does not support reasoning effort ${effort}`, "UNSUPPORTED_REASONING_EFFORT");
  }
  const system = [options.system, historySystem].filter(Boolean).join("\n\n");
  return {
    model: options.model,
    stream: true,
    messages,
    max_tokens: options.maxTokens ?? model?.maxTokens ?? connection.maxTokens,
    thinking: { type: effort === "off" ? "disabled" : "enabled" },
    ...effort === "off" ? {} : { output_config: { effort } },
    ...system.length === 0 ? {} : { system },
    ...options.temperature === void 0 ? {} : { temperature: options.temperature },
    ...options.stop === void 0 ? {} : { stop_sequences: options.stop },
    ...options.tools === void 0 ? {} : {
      tools: options.tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.parameters,
        ...tool.deferLoading === true ? { defer_loading: true } : {}
      }))
    }
  };
}

// node_modules/eventsource-parser/dist/index.js
var ParseError = class extends Error {
  constructor(message, options) {
    super(message), this.name = "ParseError", this.type = options.type, this.field = options.field, this.value = options.value, this.line = options.line;
  }
};
var LF = 10;
var CR = 13;
var SPACE = 32;
function noop(_arg) {
}
function createParser(config) {
  if (typeof config == "function")
    throw new TypeError(
      "`config` must be an object, got a function instead. Did you mean `createParser({onEvent: fn})`?"
    );
  const { onEvent = noop, onError = noop, onRetry = noop, onComment, maxBufferSize } = config, pendingFragments = [];
  let pendingFragmentsLength = 0, isFirstChunk = true, id, data = "", dataLines = 0, eventType, terminated = false;
  function feed(chunk) {
    if (terminated)
      throw new Error(
        "Cannot feed parser: it was terminated after exceeding the configured max buffer size. Call `reset()` to resume parsing."
      );
    if (isFirstChunk && (isFirstChunk = false, chunk.charCodeAt(0) === 239 && chunk.charCodeAt(1) === 187 && chunk.charCodeAt(2) === 191 && (chunk = chunk.slice(3))), pendingFragments.length === 0) {
      const trailing2 = processLines(chunk);
      trailing2 !== "" && (pendingFragments.push(trailing2), pendingFragmentsLength = trailing2.length), checkBufferSize();
      return;
    }
    if (chunk.indexOf(`
`) === -1 && chunk.indexOf("\r") === -1) {
      pendingFragments.push(chunk), pendingFragmentsLength += chunk.length, checkBufferSize();
      return;
    }
    pendingFragments.push(chunk);
    const input = pendingFragments.join("");
    pendingFragments.length = 0, pendingFragmentsLength = 0;
    const trailing = processLines(input);
    trailing !== "" && (pendingFragments.push(trailing), pendingFragmentsLength = trailing.length), checkBufferSize();
  }
  function checkBufferSize() {
    maxBufferSize !== void 0 && (pendingFragmentsLength + data.length <= maxBufferSize || (terminated = true, pendingFragments.length = 0, pendingFragmentsLength = 0, id = void 0, data = "", dataLines = 0, eventType = void 0, onError(
      new ParseError(`Buffered data exceeded max buffer size of ${maxBufferSize} characters`, {
        type: "max-buffer-size-exceeded"
      })
    )));
  }
  function processLines(chunk) {
    let searchIndex = 0;
    if (chunk.indexOf("\r") === -1) {
      let lfIndex = chunk.indexOf(`
`, searchIndex);
      for (; lfIndex !== -1; ) {
        if (searchIndex === lfIndex) {
          dataLines > 0 && onEvent({ id, event: eventType, data }), id = void 0, data = "", dataLines = 0, eventType = void 0, searchIndex = lfIndex + 1, lfIndex = chunk.indexOf(`
`, searchIndex);
          continue;
        }
        const firstCharCode = chunk.charCodeAt(searchIndex);
        if (isDataPrefix(chunk, searchIndex, firstCharCode)) {
          const valueStart = chunk.charCodeAt(searchIndex + 5) === SPACE ? searchIndex + 6 : searchIndex + 5, value = chunk.slice(valueStart, lfIndex);
          if (dataLines === 0 && chunk.charCodeAt(lfIndex + 1) === LF) {
            onEvent({ id, event: eventType, data: value }), id = void 0, data = "", eventType = void 0, searchIndex = lfIndex + 2, lfIndex = chunk.indexOf(`
`, searchIndex);
            continue;
          }
          data = dataLines === 0 ? value : `${data}
${value}`, dataLines++;
        } else isEventPrefix(chunk, searchIndex, firstCharCode) ? eventType = chunk.slice(
          chunk.charCodeAt(searchIndex + 6) === SPACE ? searchIndex + 7 : searchIndex + 6,
          lfIndex
        ) || void 0 : parseLine(chunk, searchIndex, lfIndex);
        searchIndex = lfIndex + 1, lfIndex = chunk.indexOf(`
`, searchIndex);
      }
      return chunk.slice(searchIndex);
    }
    for (; searchIndex < chunk.length; ) {
      const crIndex = chunk.indexOf("\r", searchIndex), lfIndex = chunk.indexOf(`
`, searchIndex);
      let lineEnd = -1;
      if (crIndex !== -1 && lfIndex !== -1 ? lineEnd = crIndex < lfIndex ? crIndex : lfIndex : crIndex !== -1 ? crIndex === chunk.length - 1 ? lineEnd = -1 : lineEnd = crIndex : lfIndex !== -1 && (lineEnd = lfIndex), lineEnd === -1)
        break;
      parseLine(chunk, searchIndex, lineEnd), searchIndex = lineEnd + 1, chunk.charCodeAt(searchIndex - 1) === CR && chunk.charCodeAt(searchIndex) === LF && searchIndex++;
    }
    return chunk.slice(searchIndex);
  }
  function parseLine(chunk, start, end) {
    if (start === end) {
      dispatchEvent();
      return;
    }
    const firstCharCode = chunk.charCodeAt(start);
    if (isDataPrefix(chunk, start, firstCharCode)) {
      const valueStart = chunk.charCodeAt(start + 5) === SPACE ? start + 6 : start + 5, value2 = chunk.slice(valueStart, end);
      data = dataLines === 0 ? value2 : `${data}
${value2}`, dataLines++;
      return;
    }
    if (isEventPrefix(chunk, start, firstCharCode)) {
      eventType = chunk.slice(chunk.charCodeAt(start + 6) === SPACE ? start + 7 : start + 6, end) || void 0;
      return;
    }
    if (firstCharCode === 105 && chunk.charCodeAt(start + 1) === 100 && chunk.charCodeAt(start + 2) === 58) {
      const value2 = chunk.slice(chunk.charCodeAt(start + 3) === SPACE ? start + 4 : start + 3, end);
      value2.includes("\0") || (id = value2);
      return;
    }
    if (firstCharCode === 58) {
      if (onComment) {
        const line2 = chunk.slice(start, end);
        onComment(line2.slice(chunk.charCodeAt(start + 1) === SPACE ? 2 : 1));
      }
      return;
    }
    const line = chunk.slice(start, end), fieldSeparatorIndex = line.indexOf(":");
    if (fieldSeparatorIndex === -1) {
      processField(line, "", line);
      return;
    }
    const field = line.slice(0, fieldSeparatorIndex), offset = line.charCodeAt(fieldSeparatorIndex + 1) === SPACE ? 2 : 1, value = line.slice(fieldSeparatorIndex + offset);
    processField(field, value, line);
  }
  function processField(field, value, line) {
    switch (field) {
      case "event":
        eventType = value || void 0;
        break;
      case "data":
        data = dataLines === 0 ? value : `${data}
${value}`, dataLines++;
        break;
      case "id":
        value.includes("\0") || (id = value);
        break;
      case "retry":
        /^\d+$/.test(value) ? onRetry(parseInt(value, 10)) : onError(
          new ParseError(`Invalid \`retry\` value: "${value}"`, {
            type: "invalid-retry",
            value,
            line
          })
        );
        break;
      default:
        onError(
          new ParseError(
            `Unknown field "${field.length > 20 ? `${field.slice(0, 20)}\u2026` : field}"`,
            { type: "unknown-field", field, value, line }
          )
        );
        break;
    }
  }
  function dispatchEvent() {
    dataLines > 0 && onEvent({
      id,
      event: eventType,
      data
    }), id = void 0, data = "", dataLines = 0, eventType = void 0;
  }
  function reset(options = {}) {
    if (options.consume && pendingFragments.length > 0) {
      const incompleteLine = pendingFragments.join("");
      parseLine(incompleteLine, 0, incompleteLine.length);
    }
    isFirstChunk = true, id = void 0, data = "", dataLines = 0, eventType = void 0, pendingFragments.length = 0, pendingFragmentsLength = 0, terminated = false;
  }
  return { feed, reset };
}
function isDataPrefix(chunk, i, firstCharCode) {
  return firstCharCode === 100 && chunk.charCodeAt(i + 1) === 97 && chunk.charCodeAt(i + 2) === 116 && chunk.charCodeAt(i + 3) === 97 && chunk.charCodeAt(i + 4) === 58;
}
function isEventPrefix(chunk, i, firstCharCode) {
  return firstCharCode === 101 && chunk.charCodeAt(i + 1) === 118 && chunk.charCodeAt(i + 2) === 101 && chunk.charCodeAt(i + 3) === 110 && chunk.charCodeAt(i + 4) === 116 && chunk.charCodeAt(i + 5) === 58;
}

// node_modules/eventsource-parser/dist/stream.js
var EventSourceParserStream = class extends TransformStream {
  constructor({ onError, onRetry, onComment, maxBufferSize } = {}) {
    let parser;
    super({
      start(controller) {
        parser = createParser({
          onEvent: (event) => {
            controller.enqueue(event);
          },
          onError(error) {
            typeof onError == "function" && onError(error), (onError === "terminate" || error.type === "max-buffer-size-exceeded") && controller.error(error);
          },
          onRetry,
          onComment,
          maxBufferSize
        });
      },
      transform(chunk) {
        parser.feed(chunk);
      }
    });
  }
};

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/transport.ts
function providerErrorDetail2(raw) {
  const error = typeof raw === "object" && raw !== null && "error" in raw ? raw.error : void 0;
  if (typeof error !== "object" || error === null) return "";
  const fields = error;
  return [fields.code, fields.type, fields.message].filter((value) => typeof value === "string").join(" ");
}
function providerError(raw, status, headers) {
  const envelope = typeof raw === "object" && raw !== null ? raw : {};
  const error = typeof envelope.error === "object" && envelope.error !== null ? envelope.error : {};
  const message = typeof error.message === "string" ? error.message : `DeepSeek Messages request failed (${status ?? "stream error"})`;
  const type = typeof error.type === "string" ? error.type : "";
  const detail = `${type} ${typeof error.code === "string" ? error.code : ""} ${message}`;
  let code;
  if (status === 401 || status === 403 || ["authentication_error", "permission_error"].includes(type)) code = "AUTH";
  else if (isQuotaExceededError(detail) || status === 402) code = "QUOTA";
  else if (status === 429 || type === "rate_limit_error") code = "RATE_LIMIT";
  else if (isContextWindowExceededError(detail)) code = "CONTEXT_WINDOW_EXCEEDED";
  else if (status === 400 || status === 413 || type === "invalid_request_error") code = "INVALID_REQUEST";
  else if (status !== void 0 && status >= 500 || ["api_error", "overloaded_error"].includes(type)) code = "SERVER";
  else code = status === void 0 ? "SERVER" : `HTTP_${status}`;
  const retry = headers?.get("retry-after");
  const delay = retry == null ? NaN : /^\d+(?:\.\d+)?$/u.test(retry) ? Number(retry) * 1e3 : Date.parse(retry) - Date.now();
  const id = headers?.get("request-id") ?? headers?.get("x-request-id") ?? headers?.get("x-deepseek-request-id");
  return new LlmError(message, code, {
    ...status === void 0 ? {} : { status },
    ...id ? { requestId: ProviderRequestId(id) } : {},
    ...Number.isFinite(delay) && delay > 0 ? { providerRetryAfterMs: delay } : {}
  });
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/sse.ts
async function* parseSse(body, activity) {
  const events = body.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream({ onComment: activity }));
  for await (const frame of events) {
    activity();
    let raw;
    try {
      raw = JSON.parse(frame.data);
    } catch (_invalidSseJson) {
      throw new LlmError("DeepSeek Messages SSE contains invalid JSON", "MALFORMED_RESPONSE");
    }
    const event = object(raw);
    if (typeof event.type !== "string" || frame.event !== void 0 && frame.event !== event.type) {
      throw new LlmError("DeepSeek Messages SSE event type mismatch", "MALFORMED_RESPONSE");
    }
    if (event.type === "error") throw providerError(event, void 0);
    yield event;
  }
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/translate.ts
function string(value) {
  if (typeof value !== "string") throw new LlmError("DeepSeek Messages expected a string field", "MALFORMED_RESPONSE");
  return value;
}
function malformed(detail) {
  throw new LlmError(`DeepSeek Messages stream: ${detail}`, "MALFORMED_RESPONSE");
}
function indexOf(event) {
  if (!Number.isSafeInteger(event.index) || event.index < 0) return malformed("invalid block index");
  return event.index;
}
function updateUsage(usage, raw) {
  const fields = object(raw);
  const keys = { input_tokens: "inputTokens", output_tokens: "outputTokens", cache_read_input_tokens: "cacheReadTokens", cache_creation_input_tokens: "cacheWriteTokens" };
  for (const [wire, local] of Object.entries(keys)) {
    const value = fields[wire];
    if (value === void 0) continue;
    if (!Number.isSafeInteger(value) || value < 0) return malformed(`invalid ${wire}`);
    usage[local] = value;
  }
}
function startBlock(event, index) {
  const native = object(event.content_block);
  let content;
  let replay;
  switch (native.type) {
    case "text":
      content = { type: "text", text: string(native.text) };
      replay = { type: "text" };
      break;
    case "thinking":
      content = { type: "reasoning", text: string(native.thinking) };
      replay = { type: "reasoning", ...native.signature === void 0 ? {} : { signature: string(native.signature) } };
      break;
    case "tool_use":
      content = { type: "tool-call", id: ToolCallId(string(native.id)), name: string(native.name), arguments: JSON.stringify(object(native.input)) };
      if (!content.id || !content.name) return malformed("empty tool identity");
      replay = { type: "tool-call" };
      break;
    default:
      throw new LlmError(`DeepSeek Messages does not support response block ${String(native.type)}`, "UNSUPPORTED_CONTENT");
  }
  return { index, content, replay, closed: false, json: "" };
}
function deltaChunk(block, raw) {
  const delta = object(raw);
  const content = block.content;
  if (delta.type === "text_delta" && content.type === "text") {
    const text = string(delta.text);
    content.text += text;
    return { type: "text-delta", index: block.index, text };
  }
  if (delta.type === "thinking_delta" && content.type === "reasoning") {
    const text = string(delta.thinking);
    content.text += text;
    return { type: "reasoning-delta", index: block.index, text };
  }
  if (delta.type === "signature_delta" && content.type === "reasoning") {
    block.replay.signature = (block.replay.signature ?? "") + string(delta.signature);
    return void 0;
  }
  if (delta.type === "input_json_delta" && content.type === "tool-call") {
    const argumentsDelta = string(delta.partial_json);
    block.json += argumentsDelta;
    return { type: "tool-call-delta", index: block.index, id: content.id, argumentsDelta };
  }
  return malformed(`unsupported delta ${String(delta.type)} for ${content.type}`);
}
function stopReason(raw) {
  switch (raw) {
    case "end_turn":
    case "stop_sequence":
      return { kind: "stop" };
    case "tool_use":
      return { kind: "tool-calls" };
    case "max_tokens":
      return { kind: "max-tokens" };
    default:
      return malformed(`unsupported stop reason ${String(raw)}`);
  }
}
async function* translate(events, model) {
  const blocks = /* @__PURE__ */ new Map();
  const usage = { inputTokens: 0, outputTokens: 0 };
  let started = false;
  let reason;
  for await (const event of events) {
    if (event.type === "message_start") {
      if (started) return malformed("duplicate message_start");
      updateUsage(usage, object(event.message).usage);
      started = true;
      continue;
    }
    if (!["content_block_start", "content_block_delta", "content_block_stop", "message_delta", "message_stop"].includes(String(event.type))) {
      continue;
    }
    if (!started) return malformed("event precedes message_start");
    if (event.type === "content_block_start") {
      const wireIndex = indexOf(event);
      if (blocks.has(wireIndex) || reason !== void 0) return malformed("block starts after settlement or repeats an index");
      const block = startBlock(event, blocks.size);
      blocks.set(wireIndex, block);
      yield { type: "block-start", index: block.index, blockType: block.content.type };
      if (block.content.type === "text" || block.content.type === "reasoning") {
        if (block.content.text) yield { type: block.content.type === "text" ? "text-delta" : "reasoning-delta", index: block.index, text: block.content.text };
      } else {
        yield { type: "tool-call-delta", index: block.index, id: block.content.id, name: block.content.name, argumentsDelta: "" };
      }
    } else if (event.type === "content_block_delta" || event.type === "content_block_stop") {
      const block = blocks.get(indexOf(event));
      if (block === void 0 || block.closed) return malformed("delta/stop without an open block");
      if (event.type === "content_block_delta") {
        const chunk = deltaChunk(block, event.delta);
        if (chunk !== void 0) yield chunk;
      } else {
        block.closed = true;
        if (block.content.type === "tool-call" && block.json.length > 0) block.content.arguments = block.json;
        yield { type: "block-end", index: block.index, block: { ...block.content } };
      }
    } else if (event.type === "message_delta") {
      const delta = object(event.delta);
      if (delta.stop_reason != null) reason = stopReason(delta.stop_reason);
      if (event.usage !== void 0) updateUsage(usage, event.usage);
    } else {
      if (reason === void 0 || [...blocks.values()].some((block) => !block.closed)) return malformed("message_stop without settled blocks and stop reason");
      if (blocks.size === 0 && reason.kind === "stop") throw new LlmError("DeepSeek Messages returned no content", "EMPTY_RESPONSE");
      if (reason.kind !== "max-tokens") {
        for (const { content } of blocks.values()) {
          if (content.type !== "tool-call") continue;
          let parsed;
          try {
            parsed = JSON.parse(content.arguments);
          } catch (_invalidProviderToolJson) {
            return malformed("tool input is invalid JSON");
          }
          object(parsed);
        }
      }
      usage.totalTokens = usage.inputTokens + usage.outputTokens + (usage.cacheReadTokens ?? 0) + (usage.cacheWriteTokens ?? 0);
      yield { type: "usage", usage };
      yield { type: "finish", reason, replayState: replayState(model, [...blocks.values()].map((block) => block.replay)) };
      return;
    }
  }
  throw new LlmError("DeepSeek Messages stream ended before message_stop", "STREAM_CLOSED");
}

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/adapter.ts
var DeepSeekAdapter = class extends LlmAdapter {
  constructor(dependencies) {
    super();
    this.dependencies = dependencies;
    this.files = dependencies.resolveFiles?.() ?? new DeepSeekFileStore();
  }
  files;
  imageAccess = (ref) => {
    const attachments = this.dependencies.resolveAttachments?.();
    return attachments === void 0 ? void 0 : this.dependencies.resolveImageAccess?.(attachments, ref);
  };
  providerInfo(provider) {
    return { id: provider, name: this.dependencies.providerName ?? "DeepSeek" };
  }
  providerRetryPolicy(_provider) {
    return this.dependencies.options().retryPolicy;
  }
  async listModels(provider) {
    return this.dependencies.discoverModels?.(provider) ?? [];
  }
  async resolveModel(provider, model, signal) {
    return modelInfo(await this.connection(signal), provider, model);
  }
  imageRequestPricing(_provider, model) {
    return deepSeekImageRequestPricing(this.dependencies.options(), model, this.imageAccess);
  }
  imageRequestTarget(_provider, model, image) {
    const entry = this.dependencies.options().models.find((entry2) => entry2.id === model);
    if (entry === void 0) throw new LlmError(`DeepSeek model "${model}" has no declared image projection`, "UNKNOWN_MODEL");
    return resolveRequestImageTarget(entry, image);
  }
  async prepareCall(provider, model, signal) {
    const connection = await this.connection(signal);
    this.dependencies.admit?.(connection, model);
    return { model: modelInfo(connection, provider, model), stream: (options) => this.generate(options, connection) };
  }
  stream(options) {
    const connection = this.dependencies.options();
    this.dependencies.admit?.(connection, options.model);
    return this.generate(options, connection);
  }
  connection(signal) {
    return this.dependencies.connect?.(signal) ?? Promise.resolve(this.dependencies.options());
  }
  async *generate(options, connection) {
    var _stack = [];
    try {
      const consumer = new AbortController();
      const signal = options.signal === void 0 ? consumer.signal : AbortSignal.any([consumer.signal, options.signal]);
      const watchdog = __using(_stack, idleWatchdog(signal, connection.streamIdleTimeoutMs, "MESSAGES_IDLE"));
      const iterator = this.request(options, connection, watchdog.signal, () => {
        watchdog.pulse();
      });
      try {
        while (true) {
          const next = await watchdog.next(iterator);
          if (next.done) return;
          yield next.value;
        }
      } catch (error) {
        if (timeoutOf(watchdog.signal, "MESSAGES_IDLE") !== void 0) throw new LlmError("DeepSeek Messages stream idle timeout", "TIMEOUT", { cause: error });
        if (options.signal?.aborted) throw new LlmError("DeepSeek Messages request aborted", "ABORTED", { cause: error });
        if (error instanceof LlmError) throw error;
        throw new LlmError("DeepSeek Messages transport failed", "TRANSPORT", { cause: error });
      } finally {
        consumer.abort();
        void iterator.return(void 0).catch(() => {
        });
      }
    } catch (_) {
      var _error = _, _hasError = true;
    } finally {
      __callDispose(_stack, _error, _hasError);
    }
  }
  async *request(options, connection, signal, activity) {
    signal.throwIfAborted();
    const { messages, versions } = await prepareImages(
      options.messages,
      connection,
      options.model,
      this.dependencies.resolveAttachments?.(),
      this.imageAccess,
      signal
    );
    const auth = await this.dependencies.resolveAuth(connection);
    try {
      const files = new RequestFiles(
        this.files,
        {
          baseURL: connection.baseURL,
          headers: auth.headers
        },
        connection.filePolicy,
        connection.filesApiTimeoutMs,
        signal,
        activity
      );
      let inline = false;
      while (true) {
        signal.throwIfAborted();
        files.beginAttempt();
        let fileIds;
        if (!inline) {
          try {
            fileIds = await prepareFileIds(messages, versions, files);
          } catch (error) {
            if (!(error instanceof FileResolutionFailure)) throw error;
            inline = true;
            continue;
          }
        }
        const history = inline ? inlineImages(messages, versions, connection) : messages;
        const body = serialize(options, connection, history, versions, this.imageAccess, (reason) => {
          this.dependencies.onReplayDegrade?.({ provider: options.provider, model: options.model, reason });
        }, fileIds);
        const requestIdentity = {
          signal,
          ...options.sessionId === void 0 ? {} : { sessionId: String(options.sessionId) },
          ...options.purpose === void 0 ? {} : { purpose: options.purpose }
        };
        const extensions = await prepareRequestExtensions(
          body,
          requestIdentity,
          this.dependencies.prepareExtensions,
          (fields, error) => {
            this.dependencies.onExtensionsOmitted?.({ provider: options.provider, model: options.model, fields, error });
          },
          (error) => {
            this.dependencies.onExtensionsUnaccepted?.({ provider: options.provider, model: options.model, error });
          }
        );
        signal.throwIfAborted();
        const betas = [
          ...fileIds !== void 0 && fileIds.size > 0 ? [MESSAGES_FILES_BETA] : [],
          ...body.messages.some((message) => message.content.some((block) => block.type === "tool_addition" || block.type === "tool_removal")) ? [MESSAGES_TOOL_CHANGES_BETA] : []
        ];
        const response = await fetch(`${messagesApiRoot(connection.baseURL)}/messages`, {
          method: "POST",
          signal,
          body: extensions.payload,
          redirect: "error",
          headers: {
            ...attributionHeaders(),
            "content-type": "application/json",
            "accept": "text/event-stream",
            ...auth.headers,
            "anthropic-version": "2023-06-01",
            ...betas.length === 0 ? {} : { "anthropic-beta": betas.join(",") },
            "x-deepseek-harness-user-id": this.dependencies.resolveUserId(),
            ...options.sessionId === void 0 ? {} : { "x-deepseek-harness-session-id": String(options.sessionId) },
            ...requestIdentity.purpose === "compaction" ? { "x-deepseek-harness-compact": "1" } : {}
          }
        });
        if (!response.ok) {
          const text = await response.text();
          let raw;
          try {
            raw = JSON.parse(text);
          } catch (_nonJsonGatewayError) {
          }
          const detail = providerErrorDetail2(raw);
          if (await files.retry(detail)) continue;
          const failure = providerError(raw, response.status, response.headers);
          const message = files.errorMessage(response.status, failure.message, detail);
          throw LlmError.fromFailure({ ...failure.failure, message }, { cause: new Error(text) });
        }
        await extensions.accept();
        if (response.body === null) throw new LlmError("DeepSeek Messages returned no response body", "EMPTY_RESPONSE");
        yield* translate(parseSse(response.body, activity), options.model);
        return;
      }
    } catch (error) {
      if (auth.onRequestError !== void 0) {
        let mapped;
        try {
          mapped = await auth.onRequestError(error);
        } catch (_credentialUpdateFailed) {
          throw error;
        }
        throw mapped;
      }
      throw error;
    }
  }
};

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/identity/anonymous-user-id/src/index.ts
import { randomUUID as randomUUID2 } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname as dirname4, join as join3 } from "node:path";

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/listing-cache.ts
import { createHash as createHash3 } from "node:crypto";

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/listing.ts
var GRAPHEMES = new Intl.Segmenter(void 0, { granularity: "grapheme" });
var OWN_METADATA = `client_metadata["${APP_IDENTITY.product}"]`;

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/listing-config.ts
var DEFAULT_MODELS_TIMEOUT_MS = 5e3;
var DEFAULT_MODELS_MAX_AGE_MS = 6e5;
var modelListingConfigFields = {
  modelsTimeoutMs: src_default.number().min(Number.MIN_VALUE).max(MAX_TIMER_DELAY_MS).default(DEFAULT_MODELS_TIMEOUT_MS).volatile(),
  modelsMaxAgeMs: src_default.number().step(1).min(0).max(Number.MAX_SAFE_INTEGER).default(DEFAULT_MODELS_MAX_AGE_MS).volatile()
};

// reference/full-source/deepseek-harness-e8f7b93a344964de3dca1ace9e72b6e4d6de87cb/packages/llm/llm-deepseek/src/listed-catalog.ts
var import_semver = __toESM(require_semver2(), 1);
export {
  DeepSeekAdapter,
  contentHasFile,
  contentHasImage,
  projectFilesToText,
  projectImagesForTextModel,
  projectToolUpdates,
  resolveAdapterOptions,
  resolveImageAttachmentAccess
};
//# sourceMappingURL=dsh-native.mjs.map
