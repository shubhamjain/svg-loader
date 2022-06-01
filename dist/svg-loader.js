/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./lib/counter.js":
/*!************************!*\
  !*** ./lib/counter.js ***!
  \************************/
/***/ ((module) => {

"use strict";


let counter = 0;

module.exports = {
    incr () {
        return ++counter;
    },

    decr () {
        return --counter;
    },

    curr () {
        return counter;
    }
};

/***/ }),

/***/ "./lib/css-url-fixer.js":
/*!******************************!*\
  !*** ./lib/css-url-fixer.js ***!
  \******************************/
/***/ ((module) => {

"use strict";


/**
 * Handle all SVG references correctly, which can be
 *   a) via attributes: url(#abc)
 *   b) via tags: <use href="#abc" />
 *   c) via css: .class { fill: url(#abc) }
 * @param {object} idMap: Map previous id with the new unique id
 * @param {string} attributeValueOrCSS
 * @param {string} attributeName
 * @returns attribute or css value with correct id
 */
module.exports = (idMap, attributeValueOrCSS, attributeName = "") => {
    const svgRefRegex = /url\(['"]?#([\w:.-]+)['"]?\)/g;
    const urlRefRegex = /#([\w:.-]+)/g;

    // fill="url(#abc)" -> fill="url(#abc_2)"
    // Use the unique IDs created previously
    if (attributeValueOrCSS.match(svgRefRegex)) {
        attributeValueOrCSS = attributeValueOrCSS.replace(svgRefRegex, function (g0, g1) {
            if (!idMap[g1]) {
                return g0;
            }
            return `url(#${idMap[g1]})`;
        });
    }

    // <use href="#X" -> <use href="#X_23"
    // Use the unique IDs created previously
    if (["href", "xlink:href"].includes(attributeName)) {
        if (attributeValueOrCSS.match(urlRefRegex)) {
            attributeValueOrCSS = attributeValueOrCSS.replace(urlRefRegex, function (g0, g1) {
                if (!idMap[g1]) {
                    return g0;
                }
                return `#${idMap[g1]}`;
            });
        }
    }
    return attributeValueOrCSS;
};


/***/ }),

/***/ "./lib/scope-css.js":
/*!**************************!*\
  !*** ./lib/scope-css.js ***!
  \**************************/
/***/ ((module) => {

"use strict";


// Source: https://github.com/thomaspark/scoper
module.exports = (css, prefix, idMap) => {
    const re = new RegExp("([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)", "g");
    css = css.replace(re, function (g0, g1, g2) {

        if (g1.match(/^\s*(@media|@.*keyframes|to|from|@font-face|1?[0-9]?[0-9])/)) {
            return g1 + g2;
        }

        const idRegex = /#(\w+)/;
        const match = g1.match(idRegex);

        if (match && idMap[match[1]]) {
            g1 = g1.replace(match[0], `#${idMap[match[1]]}`);
        }

        g1 = g1.replace(/^(\s*)/, "$1" + prefix + " ");

        return g1 + g2;
    });

    return css;
};

/***/ }),

/***/ "./node_modules/@sifrr/storage/dist/sifrr.storage.min.js":
/*!***************************************************************!*\
  !*** ./node_modules/@sifrr/storage/dist/sifrr.storage.min.js ***!
  \***************************************************************/
/***/ (function() {

/*! Sifrr.Storage v0.0.9 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
this.Sifrr=this.Sifrr||{},this.Sifrr.Storage=function(t){"use strict";var e=Object.prototype.toString,r="~SS%l3g5k3~";function s(t){var e=t;if("string"==typeof t)try{e=t=JSON.parse(t)}catch(t){// do nothing
}if("string"==typeof t&&t.indexOf(r)>0){var[n,i,a]=t.split(r);e="ArrayBuffer"===n?new Uint8Array(i.split(",").map(t=>parseInt(t))).buffer:"Blob"===n?function(t,e){return new Blob([new Uint8Array(t.split(",")).buffer],{type:e})}(a,i):new window[n](i.split(","))}else if(Array.isArray(t))e=[],t.forEach((t,r)=>{e[r]=s(t)});else if("object"==typeof t){if(null===t)return null;for(var o in e={},t)e[o]=s(t[o])}return e}function n(t){if("object"!=typeof t)return JSON.stringify(t);if(null===t)return"null";if(Array.isArray(t))return JSON.stringify(t.map(t=>n(t)));var s=e.call(t).slice(8,-1);if("Object"===s){var i={};for(var a in t)i[a]=n(t[a]);return JSON.stringify(i)}return"ArrayBuffer"===s?t=new Uint8Array(t):"Blob"===s&&(t=t.type+r+function(t){var e=URL.createObjectURL(t),r=new XMLHttpRequest;r.open("GET",e,!1),r.send(),URL.revokeObjectURL(e);for(var s=new Uint8Array(r.response.length),n=0;n<r.response.length;++n)s[n]=r.response.charCodeAt(n);return s.toString()}(t)),s+r+t.toString()}
// always bind to storage
var i=(t,e)=>{var r=Date.now();return Object.keys(t).forEach(s=>{if(void 0!==t[s]){var{createdAt:n,ttl:i}=t[s];t[s]=t[s]&&t[s].value,0!==i&&r-n>i&&(delete t[s],e&&e(s))}}),t},a=(t,e)=>t&&t.value?(t.ttl=t.ttl||e,t.createdAt=Date.now(),t):{value:t,ttl:e,createdAt:Date.now()},o=(t,e,r)=>{if("string"==typeof t)return{[t]:a(e,r)};var s={};return Object.keys(t).forEach(e=>s[e]=a(t[e],r)),s},c=t=>Array.isArray(t)?t:[t],l={name:"SifrrStorage",version:1,description:"Sifrr Storage",size:5242880,ttl:0};class u{constructor(t=l){this.type=this.constructor.type,this.table={},Object.assign(this,l,t),this.tableName=this.name+this.version}// overwrited methods
select(t){var e=this.getStore(),r={};return t.forEach(t=>r[t]=e[t]),r}upsert(t){var e=this.getStore();for(var r in t)e[r]=t[r];return this.setStore(e),!0}delete(t){var e=this.getStore();return t.forEach(t=>delete e[t]),this.setStore(e),!0}deleteAll(){return this.setStore({}),!0}getStore(){return this.table}setStore(t){this.table=t}keys(){return Promise.resolve(this.getStore()).then(t=>Object.keys(t))}all(){return Promise.resolve(this.getStore()).then(t=>i(t,this.del.bind(this)))}get(t){return Promise.resolve(this.select(c(t))).then(t=>i(t,this.del.bind(this)))}set(t,e){return Promise.resolve(this.upsert(o(t,e,this.ttl)))}del(t){return Promise.resolve(this.delete(c(t)))}clear(){return Promise.resolve(this.deleteAll())}memoize(t,e=((...t)=>"string"==typeof t[0]?t[0]:n(t[0]))){return(...r)=>{var s=e(...r);return this.get(s).then(e=>{if(void 0===e[s]||null===e[s]){var n=t(...r);if(!(n instanceof Promise))throw Error("Only promise returning functions can be memoized");return n.then(t=>this.set(s,t).then(()=>t))}return e[s]})}}isSupported(t=!0){return!(!t||"undefined"!=typeof window&&"undefined"!=typeof document)||!(!window||!this.hasStore())}hasStore(){return!0}isEqual(t){return this.tableName==t.tableName&&this.type==t.type}// aliases
static stringify(t){return n(t)}static parse(t){return s(t)}static _add(t){this._all=this._all||[],this._all.push(t)}static _matchingInstance(t){for(var e=this._all||[],r=e.length,s=0;s<r;s++)if(e[s].isEqual(t))return e[s];return this._add(t),t}}class h extends u{constructor(t){return super(t),this.constructor._matchingInstance(this)}select(t){var e={},r=[];return t.forEach(t=>r.push(this._tx("readonly","get",t,void 0).then(r=>e[t]=r))),Promise.all(r).then(()=>e)}upsert(t){var e=[];for(var r in t)e.push(this._tx("readwrite","put",t[r],r));return Promise.all(e).then(()=>!0)}delete(t){var e=[];return t.forEach(t=>e.push(this._tx("readwrite","delete",t,void 0))),Promise.all(e).then(()=>!0)}deleteAll(){return this._tx("readwrite","clear",void 0,void 0)}_tx(t,e,r,s){var n=this;return this.store=this.store||this.createStore(n.tableName),this.store.then(i=>new Promise((a,o)=>{var c=i.transaction(n.tableName,t).objectStore(n.tableName),l=c[e].call(c,r,s);l.onsuccess=t=>a(t.target.result),l.onerror=t=>o(t.error)}))}getStore(){return this._tx("readonly","getAllKeys",void 0,void 0).then(this.select.bind(this))}createStore(t){return new Promise((e,r)=>{var s=window.indexedDB.open(t,1);s.onupgradeneeded=()=>{s.result.createObjectStore(t)},s.onsuccess=()=>e(s.result),s.onerror=()=>r(s.error)})}hasStore(){return!!window.indexedDB}static get type(){return"indexeddb"}}class p extends u{constructor(t){return super(t),this.constructor._matchingInstance(this)}parsedData(){}select(t){var e=t.map(()=>"?").join(", ");// Need to give array for ? values in executeSql's 2nd argument
return this.execSql("SELECT key, value FROM ".concat(this.tableName," WHERE key in (").concat(e,")"),t)}upsert(t){return this.getWebsql().transaction(e=>{for(var r in t)e.executeSql("INSERT OR REPLACE INTO ".concat(this.tableName,"(key, value) VALUES (?, ?)"),[r,this.constructor.stringify(t[r])])}),!0}delete(t){var e=t.map(()=>"?").join(", ");return this.execSql("DELETE FROM ".concat(this.tableName," WHERE key in (").concat(e,")"),t),!0}deleteAll(){return this.execSql("DELETE FROM ".concat(this.tableName)),!0}getStore(){return this.execSql("SELECT key, value FROM ".concat(this.tableName))}hasStore(){return!!window.openDatabase}getWebsql(){return this._store?this._store:(this._store=window.openDatabase("ss",1,this.description,this.size),this.execSql("CREATE TABLE IF NOT EXISTS ".concat(this.tableName," (key unique, value)")),this._store)}execSql(t,e=[]){var r=this;return new Promise(s=>{r.getWebsql().transaction((function(n){n.executeSql(t,e,(t,e)=>{s(r.parseResults(e))})}))})}parseResults(t){for(var e={},r=t.rows.length,s=0;s<r;s++)e[t.rows.item(s).key]=this.constructor.parse(t.rows.item(s).value);return e}static get type(){return"websql"}}class d extends u{constructor(t){return super(t),this.constructor._matchingInstance(this)}select(t){var e={};return t.forEach(t=>{var r=this.constructor.parse(this.getLocalStorage().getItem(this.tableName+"/"+t));null!==r&&(e[t]=r)}),e}upsert(t){for(var e in t)this.getLocalStorage().setItem(this.tableName+"/"+e,this.constructor.stringify(t[e]));return!0}delete(t){return t.map(t=>this.getLocalStorage().removeItem(this.tableName+"/"+t)),!0}deleteAll(){return Object.keys(this.getLocalStorage()).forEach(t=>{0===t.indexOf(this.tableName)&&this.getLocalStorage().removeItem(t)}),!0}getStore(){return this.select(Object.keys(this.getLocalStorage()).map(t=>{if(0===t.indexOf(this.tableName))return t.slice(this.tableName.length+1)}).filter(t=>void 0!==t))}getLocalStorage(){return window.localStorage}hasStore(){return!!window.localStorage}static get type(){return"localstorage"}}var f=new Date(0).toUTCString(),g="%3D",S=new RegExp(g,"g");class v extends u{constructor(t){return super(t),this.constructor._matchingInstance(this)}upsert(t){for(var e in t)this.setStore("".concat(this.tableName,"/").concat(e,"=").concat(this.constructor.stringify(t[e]).replace(/=/g,g),"; path=/"));return!0}delete(t){return t.forEach(t=>this.setStore("".concat(this.tableName,"/").concat(t,"=; expires=").concat(f,"; path=/"))),!0}deleteAll(){return this.keys().then(this.delete.bind(this))}getStore(){var t=document.cookie,e={};return t.split("; ").forEach(t=>{var[r,s]=t.split("=");0===r.indexOf(this.tableName)&&(e[r.slice(this.tableName.length+1)]=this.constructor.parse(s.replace(S,"=")))}),e}setStore(t){document.cookie=t}hasStore(){return void 0!==document.cookie}static get type(){return"cookies"}}class y extends u{constructor(t){return super(t),this.constructor._matchingInstance(this)}hasStore(){return!0}static get type(){return"jsonstorage"}}var m={[h.type]:h,[p.type]:p,[d.type]:d,[v.type]:v,[y.type]:y};return t.Cookies=v,t.IndexedDB=h,t.JsonStorage=y,t.LocalStorage=d,t.WebSQL=p,t.availableStores=m,t.getStorage=function(t){return function(t=[],e={}){t=t.concat([h.type,p.type,d.type,v.type,y.type]);for(var r=0;r<t.length;r++){var s=m[t[r]];if(s){var n=new s(e);if(n.isSupported())return n}}throw Error("No compatible storage found. Available types: "+Object.keys(m).join(", ")+".")}("string"==typeof t?[t]:(t||{}).priority,"string"==typeof t?{}:t)},t.default&&(t=t.default),t}({});
/*! (c) @aadityataparia */


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!***********************!*\
  !*** ./svg-loader.js ***!
  \***********************/


const { Storage } = (__webpack_require__(/*! @sifrr/storage */ "./node_modules/@sifrr/storage/dist/sifrr.storage.min.js").Sifrr);
const cssScope = __webpack_require__(/*! ./lib/scope-css */ "./lib/scope-css.js");
const cssUrlFixer = __webpack_require__(/*! ./lib/css-url-fixer */ "./lib/css-url-fixer.js");
const counter = __webpack_require__(/*! ./lib/counter */ "./lib/counter.js");

let options = {
  priority: ["indexeddb", "websql", "localstorage", "jsonstorage"], // Priority Array of type of storages to use
  name: "svg-loader-cache", // name of table (treat this as a variable name, i.e. no Spaces or special characters allowed)
  version: 1, // version number (integer / float / string), 1 is treated same as '1'
  desciption: "SVG Loader Cache", // description (text)
  size: 5 * 1024 * 1024, // Max db size in bytes only for websql (integer)
  ttl: 0, // Time to live/expire for data in table (in ms), 0 = forever, data will expire ttl ms after saving
};

const storage = Storage.getStorage(options);

const isCacheAvailable = async (url) => {
  try {
    let item = await storage.get(`loader_${url}`);

    if (!item) {
      return;
    }

    item = JSON.parse(item);

    if (Date.now() < item.expiry) {
      return item.data;
    } else {
      storage.del(`loader_${url}`);
      return;
    }
  } catch (e) {
    return;
  }
};

const setCache = async (url, data, cacheOpt) => {
  try {
    const cacheExp = parseInt(cacheOpt, 10);

    await storage.set(
      `loader_${url}`,
      JSON.stringify({
        data,
        expiry:
          Date.now() +
          (Number.isNaN(cacheExp) ? 60 * 60 * 1000 * 24 : cacheExp),
      })
    );
  } catch (e) {
    console.error(e);
  }
};

const DOM_EVENTS = [];
const getAllEventNames = () => {
  if (DOM_EVENTS.length) {
    return DOM_EVENTS;
  }

  for (const prop in document.head) {
    if (prop.startsWith("on")) {
      DOM_EVENTS.push(prop);
    }
  }

  return DOM_EVENTS;
};

const attributesSet = {};
const renderBody = (elem, options, body) => {
  const { enableJs, disableUniqueIds, disableCssScoping } = options;

  const parser = new DOMParser();
  const doc = parser.parseFromString(body, "text/html");
  const fragment = doc.querySelector("svg");

  const eventNames = getAllEventNames();

  // When svg-loader is loading in the same element, it's
  // important to keep track of original properties.
  const elemAttributesSet =
    attributesSet[elem.getAttribute("data-id")] || new Set();

  const elemUniqueId =
    elem.getAttribute("data-id") || `svg-loader_${counter.incr()}`;

  const idMap = {};

  if (!disableUniqueIds) {
    // Append a unique suffix for every ID so elements don't conflict.
    Array.from(doc.querySelectorAll("[id]")).forEach((elem) => {
      const id = elem.getAttribute("id");
      const newId = `${id}_${counter.incr()}`;
      elem.setAttribute("id", newId);

      idMap[id] = newId;
    });
  }

  Array.from(doc.querySelectorAll("*")).forEach((elem) => {
    // Unless explicitly set, remove JS code (default)
    if (elem.tagName === "script") {
      if (!enableJs) {
        elem.remove();
        return;
      } else {
        const scriptEl = document.createElement("script");
        scriptEl.innerHTML = elem.innerHTML;
        document.body.appendChild(scriptEl);
      }
    }

    for (let i = 0; i < elem.attributes.length; i++) {
      const { name, value } = elem.attributes[i];

      const newValue = cssUrlFixer(idMap, value, name);

      if (value !== newValue) {
        elem.setAttribute(name, newValue);
      }

      // Remove event functions: onmouseover, onclick ... unless specifically enabled
      if (eventNames.includes(name.toLowerCase()) && !enableJs) {
        elem.removeAttribute(name);
        continue;
      }

      // Remove "javascript:..." unless specifically enabled
      if (
        ["href", "xlink:href"].includes(name) &&
        value.startsWith("javascript") &&
        !enableJs
      ) {
        elem.removeAttribute(name);
      }
    }

    // .first -> [data-id="svg_loader_341xx"] .first
    // Makes sure that class names don't conflict with each other.
    if (elem.tagName === "style" && !disableCssScoping) {
      let newValue = cssScope(
        elem.innerHTML,
        `[data-id="${elemUniqueId}"]`,
        idMap
      );
      newValue = cssUrlFixer(idMap, newValue);
      if (newValue !== elem.innerHTML) elem.innerHTML = newValue;
    }
  });

  for (let i = 0; i < fragment.attributes.length; i++) {
    const { name, value } = fragment.attributes[i];

    // Don't override the attributes already defined, but override the ones that
    // were in the original element
    if (!elem.getAttribute(name) || elemAttributesSet.has(name)) {
      elemAttributesSet.add(name);
      elem.setAttribute(name, value);
    }
  }

  attributesSet[elemUniqueId] = elemAttributesSet;

  elem.setAttribute("data-id", elemUniqueId);
  elem.innerHTML = fragment.innerHTML;

  const event = new CustomEvent("iconload", {
    bubbles: true,
  });
  elem.dispatchEvent(event);

  if (elem.getAttribute("oniconload")) {
    // Handling (and executing) event attribute for our event (oniconload)
    // isn't straightforward. Because a) the code is a raw string b) there's
    // no way to specify the context for execution. So, `this` in the attribute
    // will point to `window` instead of the element itself.
    //
    // Here we are recycling a rarely used GlobalEventHandler 'onloadedmetadata'
    // and offloading the execution to the browser. This is a hack, but because
    // the event doesn't bubble, it shouldn't affect anything else in the code.
    elem.setAttribute("onloadedmetadata", elem.getAttribute("oniconload"));

    const event = new CustomEvent("loadedmetadata", {
      bubbles: false,
    });
    elem.dispatchEvent(event);

    elem.removeAttribute("onloadedmetadata");
  }
};

const requestsInProgress = {};
const memoryCache = {};

const renderIcon = async (elem) => {
  const src = elem.getAttribute("data-src");
  const cacheOpt = elem.getAttribute("data-cache");

  const enableJs = elem.getAttribute("data-js") === "enabled";
  const disableUniqueIds = elem.getAttribute("data-unique-ids") === "disabled";
  const disableCssScoping =
    elem.getAttribute("data-css-scoping") === "disabled";

  const lsCache = await isCacheAvailable(src);
  const isCachingEnabled = cacheOpt !== "disabled";

  const renderBodyCb = renderBody.bind(self, elem, {
    enableJs,
    disableUniqueIds,
    disableCssScoping,
  });

  // Memory cache optimizes same icon requested multiple
  // times on the page
  if (memoryCache[src] || (isCachingEnabled && lsCache)) {
    const cache = memoryCache[src] || lsCache;

    renderBodyCb(cache);
  } else {
    // If the same icon is being requested to rendered
    // avoid firing multiple XHRs
    if (requestsInProgress[src]) {
      setTimeout(() => renderIcon(elem), 20);
      return;
    }

    requestsInProgress[src] = true;

    fetch(src)
      .then((response) => {
        if (!response.ok) {
          throw Error(
            `Request for '${src}' returned ${response.status} (${response.statusText})`
          );
        }
        return response.text();
      })
      .then((body) => {
        const bodyLower = body.toLowerCase().trim();

        if (!(bodyLower.startsWith("<svg") || bodyLower.startsWith("<?xml"))) {
          throw Error(`Resource '${src}' returned an invalid SVG file`);
        }

        if (isCachingEnabled) {
          setCache(src, body, cacheOpt);
        }

        memoryCache[src] = body;

        renderBodyCb(body);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        delete requestsInProgress[src];
      });
  }
};

let intObserver;
if (globalThis.IntersectionObserver) {
  const intObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          renderIcon(entry.target);

          // Unobserve as soon as soon the icon is rendered
          intObserver.unobserve(entry.target);
        }
      });
    },
    {
      // Keep high root margin because intersection observer
      // can be slow to react
      rootMargin: "1200px",
    }
  );
}

const handled = [];
function renderAllSVGs() {
  Array.from(document.querySelectorAll("svg[data-src]:not([data-id])")).forEach(
    (element) => {
      if (handled.indexOf(element) !== -1) {
        return;
      }

      handled.push(element);
      if (element.getAttribute("data-loading") === "lazy") {
        intObserver.observe(element);
      } else {
        renderIcon(element);
      }
    }
  );
}

let observerAdded = false;
const addObservers = () => {
  if (observerAdded) {
    return;
  }

  observerAdded = true;
  const observer = new MutationObserver((mutationRecords) => {
    const shouldTriggerRender = mutationRecords.some((record) =>
      Array.from(record.addedNodes).some(
        (elem) =>
          elem.nodeType === Node.ELEMENT_NODE &&
          ((elem.getAttribute("data-src") && !elem.getAttribute("data-id")) || // Check if the element needs to be rendered
            elem.querySelector("svg[data-src]:not([data-id])")) // Check if any of the element's children need to be rendered
      )
    );

    // If any node is added, render all new nodes because the nodes that have already
    // been rendered won't be rendered again.
    if (shouldTriggerRender) {
      renderAllSVGs();
    }

    // If data-src is changed, re-render
    mutationRecords.forEach((record) => {
      if (record.type === "attributes") {
        renderIcon(record.target);
      }
    });
  });

  observer.observe(document.documentElement, {
    attributeFilter: ["data-src"],
    attributes: true,
    childList: true,
    subtree: true,
  });
};

if (globalThis.addEventListener) {
  // Start rendering SVGs as soon as possible
  const intervalCheck = setInterval(() => {
    renderAllSVGs();
  }, 100);

  globalThis.addEventListener("DOMContentLoaded", () => {
    clearInterval(intervalCheck);

    renderAllSVGs();
    addObservers();
  });
}

})();

/******/ })()
;
//# sourceMappingURL=svg-loader.js.map