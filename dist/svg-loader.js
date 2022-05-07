/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./lib/counter.js":
/*!************************!*\
  !*** ./lib/counter.js ***!
  \************************/
/***/ ((module) => {



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

/***/ "./node_modules/idb-keyval/dist/idb-keyval.mjs":
/*!*****************************************************!*\
  !*** ./node_modules/idb-keyval/dist/idb-keyval.mjs ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Store": () => (/* binding */ Store),
/* harmony export */   "clear": () => (/* binding */ clear),
/* harmony export */   "del": () => (/* binding */ del),
/* harmony export */   "get": () => (/* binding */ get),
/* harmony export */   "keys": () => (/* binding */ keys),
/* harmony export */   "set": () => (/* binding */ set)
/* harmony export */ });
class Store {
    constructor(dbName = 'keyval-store', storeName = 'keyval') {
        this.storeName = storeName;
        this._dbp = new Promise((resolve, reject) => {
            const openreq = indexedDB.open(dbName, 1);
            openreq.onerror = () => reject(openreq.error);
            openreq.onsuccess = () => resolve(openreq.result);
            // First time setup: create an empty object store
            openreq.onupgradeneeded = () => {
                openreq.result.createObjectStore(storeName);
            };
        });
    }
    _withIDBStore(type, callback) {
        return this._dbp.then(db => new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, type);
            transaction.oncomplete = () => resolve();
            transaction.onabort = transaction.onerror = () => reject(transaction.error);
            callback(transaction.objectStore(this.storeName));
        }));
    }
}
let store;
function getDefaultStore() {
    if (!store)
        store = new Store();
    return store;
}
function get(key, store = getDefaultStore()) {
    let req;
    return store._withIDBStore('readonly', store => {
        req = store.get(key);
    }).then(() => req.result);
}
function set(key, value, store = getDefaultStore()) {
    return store._withIDBStore('readwrite', store => {
        store.put(value, key);
    });
}
function del(key, store = getDefaultStore()) {
    return store._withIDBStore('readwrite', store => {
        store.delete(key);
    });
}
function clear(store = getDefaultStore()) {
    return store._withIDBStore('readwrite', store => {
        store.clear();
    });
}
function keys(store = getDefaultStore()) {
    const keys = [];
    return store._withIDBStore('readonly', store => {
        // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
        // And openKeyCursor isn't supported by Safari.
        (store.openKeyCursor || store.openCursor).call(store).onsuccess = function () {
            if (!this.result)
                return;
            keys.push(this.result.key);
            this.result.continue();
        };
    }).then(() => keys);
}




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
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!***********************!*\
  !*** ./svg-loader.js ***!
  \***********************/


const { get, set, del } = __webpack_require__(/*! idb-keyval */ "./node_modules/idb-keyval/dist/idb-keyval.mjs");
const cssScope = __webpack_require__(/*! ./lib/scope-css */ "./lib/scope-css.js");
const cssUrlFixer = __webpack_require__(/*! ./lib/css-url-fixer */ "./lib/css-url-fixer.js");
const counter = __webpack_require__(/*! ./lib/counter */ "./lib/counter.js");

const isCacheAvailable = async (url) => {
    try {
        let item = await get(`loader_${url}`);

        if (!item) {
            return;
        }

        item = JSON.parse(item);

        if (Date.now() < item.expiry) {
            return item.data;
        } else {
            del(`loader_${url}`);
            return;
        }
    } catch (e) {
        return;
    }
};

const setCache = async (url, data, cacheOpt) => {
    try {
        const cacheExp = parseInt(cacheOpt, 10);
        
        await set(`loader_${url}`, JSON.stringify({
            data,
            expiry: Date.now() + (Number.isNaN(cacheExp) ? 60 * 60 * 1000 * 24 : cacheExp)
        }));

    } catch (e) {
        console.error(e);
    };
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
    const elemAttributesSet = attributesSet[elem.getAttribute("data-id")] || new Set();

    const elemUniqueId = elem.getAttribute("data-id") || `svg-loader_${counter.incr()}`;

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
            const {
                name,
                value
            } = elem.attributes[i];

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
            if (["href", "xlink:href"].includes(name) && value.startsWith("javascript") && !enableJs) {
                elem.removeAttribute(name);
            }
        }

        // .first -> [data-id="svg_loader_341xx"] .first
        // Makes sure that class names don't conflict with each other.
        if (elem.tagName === "style" && !disableCssScoping) {
            let newValue = cssScope(elem.innerHTML, `[data-id="${elemUniqueId}"]`, idMap);
            newValue = cssUrlFixer(idMap, newValue);
            if (newValue !== elem.innerHTML)
                elem.innerHTML = newValue;
        }
    });

    for (let i = 0; i < fragment.attributes.length; i++) {
        const {
            name,
            value
        } = fragment.attributes[i];

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
};

const requestsInProgress = {};
const memoryCache = {};

const renderIcon = async (elem) => {
    const src = elem.getAttribute("data-src");
    const cacheOpt = elem.getAttribute("data-cache");

    const enableJs = elem.getAttribute("data-js") === "enabled";
    const disableUniqueIds = elem.getAttribute("data-unique-ids") === "disabled";
    const disableCssScoping = elem.getAttribute("data-css-scoping") === "disabled";

    const lsCache = await isCacheAvailable(src);
    const isCachingEnabled = cacheOpt !== "disabled";

    const renderBodyCb = renderBody.bind(self, elem, { enableJs, disableUniqueIds, disableCssScoping });

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
                    throw Error(`Request for '${src}' returned ${response.status} (${response.statusText})`);
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
        }, {
            // Keep high root margin because intersection observer 
            // can be slow to react
            rootMargin: "1200px"
        }
    );
}


const handled = [];
function renderAllSVGs() {
    Array.from(document.querySelectorAll("svg[data-src]:not([data-id])"))
        .forEach((element) => {
            if (handled.indexOf(element) !== -1) {
                return;
            }

            handled.push(element);
            if (element.getAttribute("data-loading") === "lazy") {
                intObserver.observe(element);
            } else {
                renderIcon(element);
            }
        });
}

let observerAdded = false;
const addObservers = () => {
    if (observerAdded) {
        return;
    }

    observerAdded = true;
    const observer = new MutationObserver((mutationRecords) => {
        const shouldTriggerRender = mutationRecords.some(
            (record) => Array.from(record.addedNodes).some(
                (elem) => elem.nodeType === Node.ELEMENT_NODE
                    && ((elem.getAttribute("data-src") && !elem.getAttribute("data-id")) // Check if the element needs to be rendered
                        || elem.querySelector("svg[data-src]:not([data-id])")) // Check if any of the element's children need to be rendered
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

    observer.observe(
        document.documentElement,
        {
            attributeFilter: ["data-src"],
            attributes: true,
            childList: true,
            subtree: true
        }
    );
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