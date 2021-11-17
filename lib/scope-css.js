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