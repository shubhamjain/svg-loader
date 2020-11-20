# SVG Loader
SVGs from an external source can be rendered via `<img>` tags, but this method has multiple drawbacks: you can't customize the fill, use CSS variables, or use focus/hover states. SVG loader is a simple JS code you can include that fetches SVGs using XHR and dynamically injects the SVG code, giving you best of both worlds: externally stored SVGs (e.g, CDN) and easily modifiable variables. 

## How to Use?
SVG Loader is designed to be plug and play. Hence, all you need to is to include the loader JS anywhere in your code, and then start using the code like this:
