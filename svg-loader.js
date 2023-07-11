"use strict";

const cssScope = require("./lib/scope-css");
const cssUrlFixer = require("./lib/css-url-fixer");
const counter = require("./lib/counter");
const { getStorage } = require("./lib/storage");

const STORAGE_NAME = "svg-loader-cache";

const memoryCache = {};
const getEntryFromCache = async (url) => {
  try {
    if (memoryCache[url]) {
      return memoryCache[url];
    }

    const storage = getStorage(STORAGE_NAME);
    let item = await storage.getItem(`loader_${url}`);

    if (!item) {
      return;
    }

    item = JSON.parse(item);

    if (Date.now() < item.expiry) {
      memoryCache[url] = item.data;
      return item.data;
    } else {
      storage.removeItem(`loader_${url}`);
      return;
    }
  } catch (e) {
    return;
  }
};

const setCache = async (url, data, cacheOpt) => {
  try {
    const storage = getStorage(STORAGE_NAME);
    const cacheExp = parseInt(cacheOpt, 10);

    await storage.setItem(
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

const renderIcon = async (elem) => {
  const src = elem.getAttribute("data-src");
  const cacheOpt = elem.getAttribute("data-cache");

  const enableJs = elem.getAttribute("data-js") === "enabled";
  const disableUniqueIds = elem.getAttribute("data-unique-ids") === "disabled";
  const disableCssScoping =
    elem.getAttribute("data-css-scoping") === "disabled";

  const cachedEntry = await getEntryFromCache(src);
  const isCachingEnabled = cacheOpt !== "disabled";

  const renderBodyCb = renderBody.bind(self, elem, {
    enableJs,
    disableUniqueIds,
    disableCssScoping,
  });

  // Memory cache optimizes same icon requested multiple times on the page
  if (cachedEntry) {
    renderBodyCb(cachedEntry);
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

        memoryCache[src] = body;
        if (isCachingEnabled) {
          setCache(src, body, cacheOpt);
        }

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
let observer;
const addObservers = () => {
  if (observerAdded) {
    return;
  }

  observerAdded = true;
  observer = new MutationObserver((mutationRecords) => {
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

  // destroy on page unload
  globalThis.addEventListener("unload", () => {
    if (intObserver) {
      intObserver.disconnect();
    }

    if (observer) {
      observer.disconnect();
    }
  });
}
