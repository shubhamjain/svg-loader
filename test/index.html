<html>
    <head>
        <link rel="stylesheet" href="/main.css">
        <style>
            body {
                padding-bottom: 80px;
            }
            .heading {
                font-weight: bold;
                margin-top: 16px;
            }

            svg {
                margin-top: 4px;
            }
        </style>
    </head>

    <h1>
        List of different examples
    </h1>
    <p>The purpose is to add as many possible ways to use svg-loader. Before pushing any change, this can be verified to make sure
        all cases are covered.
    </p>
    <br>

    <div class="heading">Local Icon</div>
    <svg data-src="/icons/cog.svg"></svg>

    <div class="heading">Local Icon (Using Fill)</div>
    <svg data-src="/icons/cog.svg" fill="red"></svg>

    <div class="heading">Icon over XHR</div>
    <svg data-src="https://unpkg.com/@mdi/svg@5.9.55/svg/cog.svg"></svg>

    <div class="heading">Icon load event (see console)</div>
    <svg data-src="https://unpkg.com/@mdi/svg@5.9.55/svg/cog.svg?loadevent=1" oniconload="console.log('Icon loaded #1', this)"></svg>

    <div class="heading">Icon load event [bubble check] (see console)</div>
    <svg data-src="https://unpkg.com/@mdi/svg@5.9.55/svg/cog.svg?loadevent=2" id="iconload"></svg>

    <script>
        window.addEventListener('iconload', (e) => {
            if (e.target.id === 'iconload') {
                console.log('Icon loaded #2', e.target);
            }
        });
    </script>

    <div class="heading">Icon using doctype declaration</div>
    <svg data-src="/icons/cog-with-doctype.svg" fill="green"></svg>

    <div class="heading">Icon over XHR (no caching)</div>
    <svg data-src="https://unpkg.com/@mdi/svg@5.9.55/svg/cog.svg?cache=disabled" fill="red" data-cache="disabled"></svg>

    <div class="heading">Icon with JS</div>
    <div>JS is disabled by default so the following icon shouldn't alert on hover</div>
    <svg data-src="/icons/cog-with-script.svg"></svg>

    <div class="heading">Icon with JS (complex)</div>
    <div>This is a more complicated SVG with JS, only map with overlay message should be shown</div>
    <svg data-src="./USStates.svg"></svg>

    <div class="heading">Icon with JS (enabled)</div>
    <div>On hover alert should be thrown</div>
    <svg data-src="/icons/cog-with-script.svg" data-js="enabled"></svg>

    <div class="heading">Icon with ID (using xlink:href)</div>
    <div>The Reference ID should be made unique</div>
    <svg data-src="/icons/svg-file-id.svg"></svg>

    <div class="heading">Icon Using SVG Sprites</div>
    <svg data-src="/icons/svg-sprite.svg#shape-youtube" fill="red" width="32" viewBox="0 0 100 100"></svg>
    <svg data-src="/icons/svg-sprite.svg#shape-twitter" fill="blue" width="32" viewBox="0 0 100 100"></svg>

    <div class="heading">Icon with ID (using href)</div>
    <svg data-src="/icons/svg-file-id-2.svg"></svg>

    <div class="heading">Icon with ID (ID starts with dash)</div>
    <svg data-src="/icons/svg-file-id-5.svg"></svg>
    
    <div class="heading">Icon with ID (using CSS + href)</div>
    <svg data-src="/icons/svg-file-id-3.svg"></svg>

    <div class="heading">Icon with ID (url() in quotes)</div>
    <svg data-src="/icons/svg-file-id-4.svg"></svg>

    <div class="heading">Icon with ID (Disabled uniqueifying)</div>
    <svg data-src="/icons/svg-file-id-4.svg" data-unique-ids="disabled"></svg>

    <div class="heading">Icon Load Using React</div>
    <div id="reactIcon">
    </div>

    <div class="heading">Icon Load Using React (Event Handling)</div>
    <div id="reactIconLoad">
    </div>
    
    <script src="./dist/svg-loader.js" type="text/javascript"></script>

    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

    <!-- Don't use this in production: -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

    <div id="root"></div>
    <script type="text/babel">
      const container = document.getElementById('reactIcon');
      const containerLoadEvent = document.getElementById('reactIconLoad');
      
      const root = ReactDOM.createRoot(container);
      const rootLoadEvent = ReactDOM.createRoot(containerLoadEvent);


      class MyApp extends React.Component {
        constructor(props) {
            super(props);
            this.ref = React.createRef()
        }
        render() {
            return (<svg data-src="/icons/cog-with-script.svg" ref={this.ref}></svg>);
        }
        componentDidMount() {
            this.ref.current.addEventListener('iconload', () => {
                console.log("Icon Loaded #3", this.ref.current)
            })
        }
      }

      root.render(<svg data-src="/icons/cog-with-script.svg"></svg>);
      rootLoadEvent.render(<MyApp></MyApp>);
    </script>
</html>