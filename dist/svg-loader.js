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

/***/ "./node_modules/idb-keyval/dist/index.js":
/*!***********************************************!*\
  !*** ./node_modules/idb-keyval/dist/index.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "clear": () => (/* binding */ clear),
/* harmony export */   "createStore": () => (/* binding */ createStore),
/* harmony export */   "del": () => (/* binding */ del),
/* harmony export */   "delMany": () => (/* binding */ delMany),
/* harmony export */   "entries": () => (/* binding */ entries),
/* harmony export */   "get": () => (/* binding */ get),
/* harmony export */   "getMany": () => (/* binding */ getMany),
/* harmony export */   "keys": () => (/* binding */ keys),
/* harmony export */   "promisifyRequest": () => (/* binding */ promisifyRequest),
/* harmony export */   "set": () => (/* binding */ set),
/* harmony export */   "setMany": () => (/* binding */ setMany),
/* harmony export */   "update": () => (/* binding */ update),
/* harmony export */   "values": () => (/* binding */ values)
/* harmony export */ });
function promisifyRequest(request) {
    return new Promise((resolve, reject) => {
        // @ts-ignore - file size hacks
        request.oncomplete = request.onsuccess = () => resolve(request.result);
        // @ts-ignore - file size hacks
        request.onabort = request.onerror = () => reject(request.error);
    });
}
function createStore(dbName, storeName) {
    const request = indexedDB.open(dbName);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    const dbp = promisifyRequest(request);
    return (txMode, callback) => dbp.then((db) => callback(db.transaction(storeName, txMode).objectStore(storeName)));
}
let defaultGetStoreFunc;
function defaultGetStore() {
    if (!defaultGetStoreFunc) {
        defaultGetStoreFunc = createStore('keyval-store', 'keyval');
    }
    return defaultGetStoreFunc;
}
/**
 * Get a value by its key.
 *
 * @param key
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function get(key, customStore = defaultGetStore()) {
    return customStore('readonly', (store) => promisifyRequest(store.get(key)));
}
/**
 * Set a value with a key.
 *
 * @param key
 * @param value
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function set(key, value, customStore = defaultGetStore()) {
    return customStore('readwrite', (store) => {
        store.put(value, key);
        return promisifyRequest(store.transaction);
    });
}
/**
 * Set multiple values at once. This is faster than calling set() multiple times.
 * It's also atomic – if one of the pairs can't be added, none will be added.
 *
 * @param entries Array of entries, where each entry is an array of `[key, value]`.
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function setMany(entries, customStore = defaultGetStore()) {
    return customStore('readwrite', (store) => {
        entries.forEach((entry) => store.put(entry[1], entry[0]));
        return promisifyRequest(store.transaction);
    });
}
/**
 * Get multiple values by their keys
 *
 * @param keys
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function getMany(keys, customStore = defaultGetStore()) {
    return customStore('readonly', (store) => Promise.all(keys.map((key) => promisifyRequest(store.get(key)))));
}
/**
 * Update a value. This lets you see the old value and update it as an atomic operation.
 *
 * @param key
 * @param updater A callback that takes the old value and returns a new value.
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function update(key, updater, customStore = defaultGetStore()) {
    return customStore('readwrite', (store) => 
    // Need to create the promise manually.
    // If I try to chain promises, the transaction closes in browsers
    // that use a promise polyfill (IE10/11).
    new Promise((resolve, reject) => {
        store.get(key).onsuccess = function () {
            try {
                store.put(updater(this.result), key);
                resolve(promisifyRequest(store.transaction));
            }
            catch (err) {
                reject(err);
            }
        };
    }));
}
/**
 * Delete a particular key from the store.
 *
 * @param key
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function del(key, customStore = defaultGetStore()) {
    return customStore('readwrite', (store) => {
        store.delete(key);
        return promisifyRequest(store.transaction);
    });
}
/**
 * Delete multiple keys at once.
 *
 * @param keys List of keys to delete.
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function delMany(keys, customStore = defaultGetStore()) {
    return customStore('readwrite', (store) => {
        keys.forEach((key) => store.delete(key));
        return promisifyRequest(store.transaction);
    });
}
/**
 * Clear all values in the store.
 *
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function clear(customStore = defaultGetStore()) {
    return customStore('readwrite', (store) => {
        store.clear();
        return promisifyRequest(store.transaction);
    });
}
function eachCursor(store, callback) {
    store.openCursor().onsuccess = function () {
        if (!this.result)
            return;
        callback(this.result);
        this.result.continue();
    };
    return promisifyRequest(store.transaction);
}
/**
 * Get all keys in the store.
 *
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function keys(customStore = defaultGetStore()) {
    return customStore('readonly', (store) => {
        // Fast path for modern browsers
        if (store.getAllKeys) {
            return promisifyRequest(store.getAllKeys());
        }
        const items = [];
        return eachCursor(store, (cursor) => items.push(cursor.key)).then(() => items);
    });
}
/**
 * Get all values in the store.
 *
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function values(customStore = defaultGetStore()) {
    return customStore('readonly', (store) => {
        // Fast path for modern browsers
        if (store.getAll) {
            return promisifyRequest(store.getAll());
        }
        const items = [];
        return eachCursor(store, (cursor) => items.push(cursor.value)).then(() => items);
    });
}
/**
 * Get all entries in the store. Each entry is an array of `[key, value]`.
 *
 * @param customStore Method to get a custom store. Use with caution (see the docs).
 */
function entries(customStore = defaultGetStore()) {
    return customStore('readonly', (store) => {
        // Fast path for modern browsers
        // (although, hopefully we'll get a simpler path some day)
        if (store.getAll && store.getAllKeys) {
            return Promise.all([
                promisifyRequest(store.getAllKeys()),
                promisifyRequest(store.getAll()),
            ]).then(([keys, values]) => keys.map((key, i) => [key, values[i]]));
        }
        const items = [];
        return customStore('readonly', (store) => eachCursor(store, (cursor) => items.push([cursor.key, cursor.value])).then(() => items));
    });
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


const { get, set, del, entries } = __webpack_require__(/*! idb-keyval */ "./node_modules/idb-keyval/dist/index.js");
const cssScope = __webpack_require__(/*! ./lib/scope-css */ "./lib/scope-css.js");
const cssUrlFixer = __webpack_require__(/*! ./lib/css-url-fixer */ "./lib/css-url-fixer.js");
const counter = __webpack_require__(/*! ./lib/counter */ "./lib/counter.js");

const isCacheAvailable = async (url) => {
    let item;

    try {
        item = await get(`loader_${url}`);
    } catch (e) {}

    if (!item) {
        try {
            item = localStorage.getItem(`loader_${url}`);
        } catch(e) {}
    }

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
};

const setCache = async (url, data, cacheOpt) => {
    const cacheExp = parseInt(cacheOpt, 10);
    const dataToSet =  JSON.stringify({
        data,
        expiry: Date.now() + (Number.isNaN(cacheExp) ? 60 * 60 * 1000 * 24 * 30 : cacheExp)
    });

    try {
        await set(`loader_${url}`, dataToSet);
    } catch (e) {
        try {
            localStorage.setItem(`loader_${url}`, dataToSet)
        } catch (e) {
            console.warn("Failed to set cache: ", e)
        }
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

    Array.from(doc.querySelectorAll("*")).forEach((el) => {
        // Unless explicitly set, remove JS code (default)
        if (el.tagName === "script") {
            el.remove();
            if (!enableJs) {
                return;
            } else {
                const scriptEl = document.createElement("script");
                scriptEl.appendChild(el.childNodes[0]);
                elem.appendChild(scriptEl)
            }
        }

        const attributesToRemove = []
        for (let i = 0; i < el.attributes.length; i++) {
            const {
                name,
                value
            } = el.attributes[i];

            const newValue = cssUrlFixer(idMap, value, name);

            if (value !== newValue) {
                el.setAttribute(name, newValue);
            }

            // Remove event functions: onmouseover, onclick ... unless specifically enabled
            if (eventNames.includes(name.toLowerCase()) && !enableJs) {
                attributesToRemove.push(name);
                continue;
            }

            // Remove "javascript:..." unless specifically enabled
            if (["href", "xlink:href"].includes(name) && value.startsWith("javascript") && !enableJs) {
                attributesToRemove.push(name);
            }
        }

        attributesToRemove.forEach((attr) => el.removeAttribute(attr))

        // .first -> [data-id="svg_loader_341xx"] .first
        // Makes sure that class names don't conflict with each other.
        if (el.tagName === "style" && !disableCssScoping) {
            let newValue = cssScope(el.innerHTML, `[data-id="${elemUniqueId}"]`, idMap);
            newValue = cssUrlFixer(idMap, newValue);
            if (newValue !== el.innerHTML)
                el.innerHTML = newValue;
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

    const event = new CustomEvent('iconload', {
        bubbles: true
    });
    elem.dispatchEvent(event);

    if (elem.getAttribute('oniconload')) {
        // Handling (and executing) event attribute for our event (oniconload)
        // isn't straightforward. Because a) the code is a raw string b) there's
        // no way to specify the context for execution. So, `this` in the attribute
        // will point to `window` instead of the element itself. 
        //
        // Here we are recycling a rarely used GlobalEventHandler 'onloadedmetadata'
        // and offloading the execution to the browser. This is a hack, but because
        // the event doesn't bubble, it shouldn't affect anything else in the code. 
        elem.setAttribute('onauxclick', elem.getAttribute('oniconload'));
        
        const event = new CustomEvent('auxclick', {
            bubbles: false,
            view: window
        });
        elem.dispatchEvent(event);

        elem.removeAttribute('onauxclick');
    }
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
    intObserver = new IntersectionObserver(
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

    function init() {
        clearInterval(intervalCheck);
    
        renderAllSVGs();
        addObservers();
    }

    if (document.readyState === 'interactive') {
        init();
    } else {
        globalThis.addEventListener("DOMContentLoaded", () => {
            init();
        });
    }
}

globalThis.SVGLoader = {}
globalThis.SVGLoader.destroyCache = async () => {
    // Handle error, "mutation operation was attempted on a database"
    // with try-catch
    try {
        const entriesCache = await entries();
        
        for (const entry of entriesCache) {
            if (entry[0].startsWith('loader_')) {
                await del(entry[0]);
            }
        }
    } catch(e) {}

    Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('loader_')) {
            localStorage.removeItem(key);
        }
    });
}

})();

/******/ })()
;
//# sourceMappingURL=svg-loader.js.map