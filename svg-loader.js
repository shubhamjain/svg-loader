"use strict";

const { get, set, del } = require("idb-keyval");
const cssScope = require("./lib/scope-css");
const counter = require("./lib/counter");

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

const setCache = (url, data, cacheOpt) => {
    const cacheExp = parseInt(cacheOpt, 10);
    
    try {
        set(`loader_${url}`, JSON.stringify({
            data,
            expiry: Date.now() + (Number.isNaN(cacheExp) ? 60 * 60 * 1000 * 24 : cacheExp)
        }));
    } catch (e) {
        return;
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

const renderBody = (elem, options, body) => {
    const { enableJs, disableUniqueIds, disableCssScoping } = options;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(body, "text/html");
    const fragment = doc.querySelector("svg");

    const eventNames = getAllEventNames();

    // When svg-loader is loading in the same element, it's
    // important to keep track of original properties.
    const elemAttributesSet = elem.getAttribute("data-attributes-set");
    const attributesSet = elemAttributesSet ? new Set(elemAttributesSet.split(",")) : new Set();

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

    const svgRefRegex = /url\("?#([a-zA-Z][\w:.-]*)"?\)/g;
    const urlRefRegex = /#([a-zA-Z][\w:.-]*)/g;

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

            // fill="url(#abc)" -> fill="url(#abc_2)"
            // Use the unique IDs created previously
            if (value.match(svgRefRegex)) {
                const newValue = value.replace(svgRefRegex, function (g0, g1) {
                    if (!idMap[g1]) {
                        return g0;
                    }

                    return `url(#${idMap[g1]})`;
                });

                if (value !== newValue) {
                    elem.setAttribute(name, newValue);
                }
            }

            // <use href="#X" -> <use href="#X_23"
            // Use the unique IDs created previously
            if (["href", "xlink:href"].includes(name)) {
                if (value.match(urlRefRegex)) {
                    const newValue = value.replace(urlRefRegex, function (g0, g1) {
                        if (!idMap[g1]) {
                            return g0;
                        }

                        return `#${idMap[g1]}`;
                    });

                    if (value !== newValue) {
                        elem.setAttribute(name, newValue);
                    }
                }
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
            elem.innerHTML = cssScope(elem.innerHTML, `[data-id="${elemUniqueId}"]`);
        }
    });

    for (let i = 0; i < fragment.attributes.length; i++) {
        const {
            name,
            value
        } = fragment.attributes[i];

        // Don't override the attributes already defined, but override the ones that
        // were in the original element
        if (!elem.getAttribute(name) || attributesSet.has(name)) {
            attributesSet.add(name);
            elem.setAttribute(name, value);
        }
    }

    elem.setAttribute("data-id", elemUniqueId);
    elem.setAttribute("data-attributes-set", Array.from(attributesSet).join(","));
    elem.setAttribute("data-rendered", true);

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

    const renderBodyCb = renderBody.bind(this, elem, { enableJs, disableUniqueIds, disableCssScoping });

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
            .then((body) => body.text())
            .then((body) => {
                if (isCachingEnabled) {
                    setCache(src, body, cacheOpt);
                }

                memoryCache[src] = body;

                renderBodyCb(body);
            })
            .finally(() => {
                delete requestsInProgress[src];
            });
    }
};

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

const handled = [];
function renderAllSVGs() {
    Array.from(document.querySelectorAll("svg[data-src]:not([data-rendered])"))
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
                    && ((elem.getAttribute("data-src") && !elem.getAttribute("data-rendered")) // Check if the element needs to be rendered
                        || elem.querySelector("svg[data-src]:not([data-rendered])")) // Check if any of the element's children need to be rendered
            )
        );

        // If any node is added, render all new nodes because the nodes that have already
        // been rendered won't be rendered again.
        if (shouldTriggerRender){
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

// Start rendering SVGs as soon as possible
const intervalCheck = setInterval(() => {
    renderAllSVGs();
}, 100);


window.addEventListener("DOMContentLoaded", () => {
    clearInterval(intervalCheck);

    renderAllSVGs();
    addObservers();
});
