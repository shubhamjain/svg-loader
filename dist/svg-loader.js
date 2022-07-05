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

/***/ "./lib/storage/index.js":
/*!******************************!*\
  !*** ./lib/storage/index.js ***!
  \******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const localStorage = __webpack_require__(/*! ./local-storage */ "./lib/storage/local-storage.js");
const indexedDB = __webpack_require__(/*! ./indexed-db */ "./lib/storage/indexed-db.js");
const mockStorage = __webpack_require__(/*! ./mock-storage */ "./lib/storage/mock-storage.js");

let storage = null;

const getAvailableStorage = async (name) => {
  if (await indexedDB.hasStorage(name)) {
    return indexedDB.getStorage(name)
  }
  else if (await localStorage.hasStorage()) {
    return localStorage.getStorage(name)
  }
  return mockStorage.getStorage()
}


const getStorage = async (name) => {
  return storage || await getAvailableStorage(name)
}

module.exports = {
  getStorage,
}

/***/ }),

/***/ "./lib/storage/indexed-db.js":
/*!***********************************!*\
  !*** ./lib/storage/indexed-db.js ***!
  \***********************************/
/***/ ((module) => {

let db = null;

/**
 * Work around Safari 14 IndexedDB open bug.
 *
 * Safari has a horrible bug where IDB requests can hang while the browser is starting up. https://bugs.webkit.org/show_bug.cgi?id=226547
 * The only solution is to keep nudging it until it's awake.
 */
const idbReady = () => {
  const isSafari =
    !navigator.userAgentData &&
    /Safari\//.test(navigator.userAgent) &&
    !/Chrom(e|ium)\//.test(navigator.userAgent);

  // No point putting other browsers or older versions of Safari through this mess.
  if (!isSafari || !indexedDB.databases) return Promise.resolve();

  let intervalId;

  return new Promise((resolve) => {
    const tryIdb = () => indexedDB.databases().finally(resolve);
    intervalId = setInterval(tryIdb, 100);
    tryIdb();
  }).finally(() => clearInterval(intervalId));
}

const openDBConnection = async (name) => {
  try {
    await idbReady(name);
    return createStore(name);
  }
  catch (e) {
    console.log("cannot create store");
  }
}

const getObjectStore = async (name, mode = "readonly") => {
  db = db || await openDBConnection(name);
  const transaction = await db.transaction([name], mode);
  return transaction.objectStore(name);
}

const createStore = (name) => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(name, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(name);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const transaction = async (name, method, mode, value, key) => {
  const objectStore = await getObjectStore(name, mode)
  return new Promise((resolve, reject) => {
    const request = objectStore[method](value, key)
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}


module.exports = {
  getStorage: (name) => {
    return ({
      async get(key) {
        return transaction(name, "get", "readonly", key);
      },
      async set(key, value) {
        return transaction(name, "put", "readwrite", value, key)
      },
      async del(key) {
        return transaction(name, "delete", "readwrite", key);
      },

    })
  },
  hasStorage: async (name) => {
    if (indexedDB) {
      try {
        await getObjectStore(name)
        return true;
      }
      catch { }
    }
    return false;
  },
};

/***/ }),

/***/ "./lib/storage/local-storage.js":
/*!**************************************!*\
  !*** ./lib/storage/local-storage.js ***!
  \**************************************/
/***/ ((module) => {

module.exports = {
  getStorage: () => {
    return ({
      get(key) {
        return JSON.parse(localStorage.getItem(key));
      },
      set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
      },
      del(key) {
        localStorage.removeItem(key);
      },
    });
  },
  hasStorage: async () => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }

  },
};

/***/ }),

/***/ "./lib/storage/mock-storage.js":
/*!*************************************!*\
  !*** ./lib/storage/mock-storage.js ***!
  \*************************************/
/***/ ((module) => {

module.exports = {
  getStorage: () => {
    return ({
      get() { },
      set() { },
      del() { }
    });
  }
};

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
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!***********************!*\
  !*** ./svg-loader.js ***!
  \***********************/


const cssScope = __webpack_require__(/*! ./lib/scope-css */ "./lib/scope-css.js");
const cssUrlFixer = __webpack_require__(/*! ./lib/css-url-fixer */ "./lib/css-url-fixer.js");
const counter = __webpack_require__(/*! ./lib/counter */ "./lib/counter.js");
const {getStorage} = __webpack_require__(/*! ./lib/storage */ "./lib/storage/index.js");

const STORAGE_NAME = "svg-loader-cache";



const isCacheAvailable = async (url) => {
  try {
    const storage = await getStorage(STORAGE_NAME);
    let item = await storage.get(`loader_${url}`);

    if (!item) {
      return;
    }

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
    const storage = await getStorage(STORAGE_NAME);
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
  intObserver = new IntersectionObserver(
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