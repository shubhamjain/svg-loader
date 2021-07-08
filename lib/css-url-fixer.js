"use strict";

module.exports = (idMap, value, name="") => {
    const svgRefRegex = /url\("?#([a-zA-Z-0-9][\w:.-]*)"?\)/g;
    const urlRefRegex = /#([a-zA-Z][\w:.-]*)/g;

    // fill="url(#abc)" -> fill="url(#abc_2)"
    // Use the unique IDs created previously
    if (value.match(svgRefRegex)) {
        value = value.replace(svgRefRegex, function (g0, g1) {
            if (!idMap[g1]) {
                return g0;
            }
            return `url(#${idMap[g1]})`;
        });
    }

    // <use href="#X" -> <use href="#X_23"
    // Use the unique IDs created previously
    if (["href", "xlink:href"].includes(name)) {
        if (value.match(urlRefRegex)) {
            value = value.replace(urlRefRegex, function (g0, g1) {
                if (!idMap[g1]) {
                    return g0;
                }
    
                return `#${idMap[g1]}`;
            });
        }
    }
    return value;
};
