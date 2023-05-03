"use strict";

const { get, set, del, entries } = require("idb-keyval");
const cssScope = require("./lib/scope-css");
const cssUrlFixer = require("./lib/css-url-fixer");
const counter = require("./lib/counter");

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
        expiry: Date.now() + (Number.isNaN(cacheExp) ? 60 * 60 * 1000 * 24 * 30 : cacheExp * 1000)
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

    for (const prop in document.body) {
        if (prop.startsWith("on")) {
            DOM_EVENTS.push(prop);
        }
    }

    return DOM_EVENTS;
};

const attributesSet = {};
const renderBody = (elem, options, body) => {
    const { enableJs, disableUniqueIds, disableCssScoping, spriteIconId } = options;

    const isSpriteIcon = !!spriteIconId;
    const parser = new DOMParser();
    const doc = parser.parseFromString(body, "text/html");
    const fragment = isSpriteIcon ? doc.getElementById(spriteIconId) : doc.querySelector("svg");

    const eventNames = getAllEventNames();

    // When svg-loader is loading in the same element, it's
    // important to keep track of original properties.
    const elemAttributesSet = attributesSet[elem.getAttribute("data-id")] || new Set();

    const elemUniqueId = elem.getAttribute("data-id") || `svg-loader_${counter.incr()}`;

    const idMap = {};

    if (!disableUniqueIds) {
        // Append a unique suffix for every ID so elements don't conflict.
        Array.from(fragment.querySelectorAll("[id]")).forEach((elem) => {
            const id = elem.getAttribute("id");
            const newId = `${id}_${counter.incr()}`;
            elem.setAttribute("id", newId);

            idMap[id] = newId;
        });
    }

    Array.from(fragment.querySelectorAll("*")).concat(fragment).forEach((el) => {
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
    
    // For a sprite we want to include the whole DOM of sprite element
    elem.innerHTML = spriteIconId ? fragment.outerHTML : fragment.innerHTML;

    // This code block basically merges attributes of the original SVG
    // the SVG element where it is called from. For eg,
    //
    // Let's say the original SVG is this:
    // 
    // a.svg = <svg viewBox='..' ...></svg>
    // 
    // and it is used as with svg-loader as <svg data-src="./a.svg" width="32"></svg>
    // this will create a combined element  <svg data-src="./a.svg" width="32" viewBox='..' ...></svg>
    // 
    // For sprite icons, we don't need this as we are including the whole outerHTML. 
    if (!isSpriteIcon) {
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
    }

    attributesSet[elemUniqueId] = elemAttributesSet;

    elem.setAttribute("data-id", elemUniqueId);

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
    const url = new URL(elem.getAttribute("data-src"), globalThis.location);
    const src = url.toString().replace(url.hash, "");
    const spriteIconId = url.hash.replace("#", "");
    
    const cacheOpt = elem.getAttribute("data-cache");

    const enableJs = elem.getAttribute("data-js") === "enabled";
    const disableUniqueIds = elem.getAttribute("data-unique-ids") === "disabled";
    const disableCssScoping = elem.getAttribute("data-css-scoping") === "disabled";

    const lsCache = await isCacheAvailable(src);
    const isCachingEnabled = cacheOpt !== "disabled";

    const renderBodyCb = renderBody.bind(self, elem, { enableJs, disableUniqueIds, disableCssScoping, spriteIconId });

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

                if (!(bodyLower.startsWith("<svg") || bodyLower.startsWith("<?xml") || bodyLower.startsWith("<!doctype") )) {
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
