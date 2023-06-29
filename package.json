{
    "name": "external-svg-loader",
    "license": "MIT",
    "description": "Plug 'n play external SVG loader",
    "homepage": "https://github.com/shubhamjain/svg-loader",
    "author": "Shubham Jain <hi@shubhamjain.co>",
    "repository": {
        "type": "git",
        "url": "https://github.com/shubhamjain/svg-loader.git"
    },
    "main": "dist/svg-loader.min.js",
    "version": "1.6.8",
    "scripts": {
        "postinstall": "npm-run-all build:*",
        "build:js": "cross-env NODE_ENV=production webpack build",
        "build:cp": "npx cpr ./dist/svg-loader.min.js ./svg-loader.min.js --overwrite",
        "build": "npm-run-all build:*",
        "dev:watch": "webpack watch --mode development",
        "dev:http": "cd test && http-server",
        "dev": "npm-run-all --parallel dev:*",
        "prepare": "husky install"
    },
    "devDependencies": {
        "http-server": "^14.0.0",
        "husky": "^8.0.3"
    },
    "dependencies": {
        "cpr":"^3.0.1",
        "cross-env": "^7.0.3",
        "idb-keyval": "^6.2.0",
        "npm-run-all": "^4.1.5",
        "webpack": "^5.72.0",
        "webpack-cli": "^4.9.2"
    }
}
