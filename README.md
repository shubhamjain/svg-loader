# SVG Loader
![minified size](http://img.badgesize.io/shubhamjain/svg-loader/master/svg-loader.min.js?label=minified%20size&v=10) ![gzip size](http://img.badgesize.io/shubhamjain/svg-loader/master/svg-loader.min.js?compression=gzip&v=10)

SVGs from an external source can be rendered via `<img>` tags, but this has multiple drawbacks: you can't customize the fill, use CSS variables, or use focus/hover states.

SVG loader is a simple JS code you can include that fetches SVGs using XHR and injects the SVG code in the tag's place, giving you best of both worlds: externally stored SVGs (e.g, on CDN) and inline SVGs.

It's super-tiny, works well with frameworks and has minimal to no impact on performance.

[**Demo →**](https://codepen.io/shubhamjainco/pen/rNyBVmY)

## How to Use?
SVG Loader is designed to be plug and play. Hence, all you need to is to include the loader JS anywhere in your code, and then start using the code like this:

### Download and Include

```html
<!-- 
    Include this script anywhere in your code, preferably <HEAD> so
    icons can be fetched faster.
-->
<script type="text/javascript" src="svg-loader.min.js" async></script>

<!-- Use an external SVG -->
<svg data-src="https://unpkg.com/@mdi/svg@5.9.55/svg/star.svg" width="50" height="50" fill="red"></svg>
<svg data-src="https://unpkg.com/@mdi/svg@5.9.55/svg/heart.svg" width="50" height="50" fill="red"></svg>

<svg data-src="https://unpkg.com/@mdi/svg@5.9.55/svg/cog.svg"
    width="50"
    height="50"
    fill="currentColor"
    style="color: purple;"></svg>
```

[**See Here →**](https://codepen.io/shubhamjainco/pen/jOBEgPY)

**Note**: Because SVG Loader fetches file using XHRs, it's limited by CORS policies of the browser. 
So you need to ensure that correct `Access-Control-Allow-Origin` headers are sent with the file being served or that the files are hosted on your own domain. 


### Or, use from a npm package
The library is framework/platform agnostic. You should be able to use it in React, Vue.js and others
as long as you're inserting the correct attributes.


```
npm install external-svg-loader
```

Then, in your app, require/import `external-svg-loader` anywhere. Here's an example for create-react-app.

```jsx
import React from "react";
import ReactDOM from "react-dom";

import "external-svg-loader";

class App extends React.Component {
  render() {
    return (
      <svg
        data-src="https://s2.svgbox.net/materialui.svg?ic=mail"
        fill="currentColor"
        width="50px"
        height="50px"
        style={{
          color: "red"
        }}
      />
    );
  }
}

ReactDOM.render(<App />, document.getElementById("container"));
```

[**See Here →**](https://codesandbox.io/s/react-playground-forked-x7w1l?file=/index.js)

### Or, use a CDN
SVG loader can also be included via unpkg CDN. Example:

```html
<script type="text/javascript" src="https://unpkg.com/external-svg-loader@1.2.0/svg-loader.min.js" async></script>
```

### Configuration

### 1. Disable/Modify Caching
By default, the XHR response is cached for 24 hours, so that any subsequent loads are instantenous. You can disable this behavior by passing `data-cache="disabled"`. You can also modify
the caching period by passing number of seconds. Example:

#### Cache for a week
```html
<svg data-src="https://unpkg.com/@mdi/svg@5.9.55/svg/heart.svg" width="50" height="50" data-cache="604800"></svg>
```

#### Cache for a six hours
```html
<svg data-src="https://unpkg.com/@mdi/svg@5.9.55/svg/heart.svg" width="50" height="50" data-cache="21600"></svg>
```

#### Disable Caching
```html
<svg data-src="https://unpkg.com/@mdi/svg@5.9.55/svg/heart.svg" width="50" height="50" data-cache="disabled"></svg>
```

### 2. Enable Javascript
SVG format supports scripting. However, for security reasons, svg-loader will strip all JS code before injecting the SVG file.
You can enable it by: 

```html
<svg data-src="https://unpkg.com/@mdi/svg@5.9.55/svg/heart.svg" data-js="enabled" width="50" height="50" fill="red"></svg>
```

### 3. Disable Unique IDs, Styling
To prevent conflicts between conflicting identifiers of different SVGs, svg-loader scopes the identifiers and styling rules, 
by adding prefixes. 

You can disable this behavior by:

#### Disable Unique IDs

```html
<svg data-src="https://unpkg.com/@mdi/svg@5.9.55/svg/heart.svg" data-unique-ids="disabled" width="50" height="50" fill="red"></svg>
```

#### Disable CSS Scoping

```html
<svg data-src="https://unpkg.com/@mdi/svg@5.9.55/svg/heart.svg" data-css-scoping="disabled" width="50" height="50" fill="red"></svg>
```

### Lazy Loading
You can also lazy load icons by using `data-loading=lazy`. This will make icon not load until it's about to enter the viewport. For lazy loading, `external-svg-loader` uses [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).

```html
<svg data-src="https://unpkg.com/@mdi/svg@5.9.55/svg/heart.svg" width="50" height="50" data-loading="lazy"></svg>
```

## LICENSE
MIT
