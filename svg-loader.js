"use strict";

const { get, set, del } = require("idb-keyval");

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

const renderBody = (elem, body) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(body, "text/html");
    const fragment = doc.querySelector("svg");

    // When svg-loader is loading in the same element, it's
    // important to keep track of original properties.
    const elemAttributesSet = elem.getAttribute("data-attributes-set");
    const attributesSet = elemAttributesSet ? new Set(elemAttributesSet.split(",")) : new Set();

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

    elem.setAttribute("data-attributes-set", Array.from(attributesSet).join(","));
    elem.setAttribute("data-rendered", true);

    
    elem.innerHTML = fragment.innerHTML;
};

const requestsInProgress = {};
const memoryCache = {};

const renderIcon = async (elem) => {
    const src = elem.getAttribute("data-src");
    const cacheOpt = elem.getAttribute("data-cache");

    const lsCache = await isCacheAvailable(src);
    const isCachingEnabled = cacheOpt !== "disabled";

    // Memory cache optimizes same icon requested multiple
    // times on the page
    if (memoryCache[src] || (isCachingEnabled && lsCache)) {
        const cache = memoryCache[src] || lsCache;

        renderBody(elem, cache);
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

                renderBody(elem, body);
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
                    && ((elem.getAttribute("data-src") && !elem.getAttribute("data-rendered"))
                        || elem.querySelector("svg[data-src]:not([data-rendered])"))
            )
        );

        // If any node is added, render all new nodes
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
