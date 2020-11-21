'use strict'

// Using CSS animations is the most reliable and efficient 
// way to detect dynamically added elements without polling
// continously.
//
// Further reading: https://davidwalsh.name/detect-node-insertion
const css = `
@keyframes nodeInserted {
        from { opacity: 0.99; }
        to { opacity: 1; }
    }
    svg[data-src] {
        animation-duration: 0.001s;
        animation-name: nodeInserted;
    }
`;

const head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');

head.appendChild(style);
style.appendChild(document.createTextNode(css));

const isCacheAvailable = (url) => {
    try {
        const item = JSON.parse(localStorage.getItem(`loader_${url}`) || '{}')

        if (!item.expiry) {
            return;
        }

        if (Date.now() < item.expiry) {
            return item.data
        } else {
            localStorage.removeItem(`loader_${url}`)
            return;
        }
    } catch (e) {
        return;
    }
}

const setCache = (url, data, cacheOpt) => {
    const cacheExp = parseInt(cacheOpt, 10)

    localStorage.setItem(`loader_${url}`, JSON.stringify({
        data,
        expiry: Date.now() + Number.isNaN(cacheExp) ? 60 * 60 * 1000 * 24 : cacheExp
    }))
}

const renderBody = (elem, body) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(body, 'text/html')
    const fragment = doc.querySelector('svg')

    for (let i = 0; i < fragment.attributes.length; i++) {
        const {
            name,
            value
        } = fragment.attributes[i]

        // Don't override the attributes already defined
        if (!elem.getAttribute(name)) {
            elem.setAttribute(name, value)
        }
    }

    elem.innerHTML = fragment.innerHTML
}

const renderIcon = (elem) => {
    const src = elem.getAttribute("data-src")
    const cacheOpt = elem.getAttribute("data-cache")

    const cache = isCacheAvailable(src)
    const isCachingEnabled = cacheOpt !== "disabled"

    if (isCachingEnabled && cache) {
        renderBody(elem, cache)
    } else {
        fetch(src)
            .then((body) => body.text())
            .then((body) => {
                if (isCachingEnabled) {
                    setCache(src, body, cacheOpt)
                }

                renderBody(elem, body)
            })
    }
}

document.addEventListener("animationstart", (e) => {
    const element = e.target

    // If the element's SRC is dynamically changed, fetch
    // and inject the SVG again.
    const observer = new MutationObserver((mutationList) => {
        mutationList.forEach((mutation) => {
            if (mutation.attributeName === "data-src") {
                renderIcon(element)
            }
        })
    });

    observer.observe(element, {
        attributes: true
    });

    if (e.animationName === "nodeInserted") {
        renderIcon(element)
    }
}, false);