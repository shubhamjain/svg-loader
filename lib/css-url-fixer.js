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
