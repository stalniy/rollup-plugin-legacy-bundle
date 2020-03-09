# Legacy bundle generation for Rollup

Babel allows us to leverage all the newest language features in ES2015+, but that also means we have to ship transpiled and polyfilled bundles in order to support older browsers. These transpiled bundles are often more verbose than the original code, and also parsed and run slower. But today a good majority of the modern browsers have support for native ES2015 features and ES modules, it is a waste that we have to ship heavier and less efficient code to those browsers just because we have to support older ones.

This plugins offers a way to solve this problem. Basically it generates legacy bundle from modern one:

```js
import { legacyBundle } from 'rollup-plugin-legacy-bundle';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/app.js',
  output: {
    format: 'es',
    dir: 'dist',
    sourcemap: true,
  },
  plugins: [
    babel({ ... }),
    legacyBundle({
      format: 'system', // use System.js for legacy bundle
      polyfills: [
        // list of polyfills modules which will be prepended to entry chunk
        'core-js/modules/es.array.find'
      ],
      plugins: [
        // additional plugins to process legacy bundle
        babel({
          inputSourceMap: true,
          exclude: [
            'node_modules/core-js/**/*.js',
            'node_modules/regenerator-runtime/runtime.js'
          ],
          presets: [
            '@babel/preset-env'
          ]
        }),
      ]
    })
  ]
}
```

With such configuration, rollup produces 2 versions of your app: one modern bundle targeting modern browsers that support ES modules, and one legacy bundle targeting older browsers that do not.

## Installation

```sh
npm i -D rollup-plugin-legacy-bundle
# or
yarn add -D rollup-plugin-legacy-bundle
```

## How does it work?

This plugins automatically consumes chunks and creates another rollup instance which generates legacy bundle from that one.

## How can I integrate with @rollup/plugin-html?

This package provide some helper functions which simplifies integration with [@rollup/plugin-html] (i.e., injects legacy js files with `nomodule` attribute and modern - with `type="module"`).

The easiest way is use to use predefined `index.html` template from this package:

```js
import { legacyBundle, indexHTML } from 'rollup-plugin-legacy-bundle';
import html from '@rollup/plugin-html';

export default {
  input: 'src/app.js',
  output: {
    format: 'es',
    dir: 'dist',
    sourcemap: true,
  },
  plugins: [
    babel({ ... }),
    legacyBundle({ ... }),
    html({
      template: indexHTML
    })
  ]
}
```

If this doesn't work for you and you need to provide a custom `template` function, then you can use `generateJs` and `generateCss` helper functions:

```js
import { legacyBundle, generateJs, generateCss } from 'rollup-plugin-legacy-bundle';
import html, { makeHtmlAttributes } from '@rollup/plugin-html';

const customIndexHTML = ({ attributes, files, publicPath, title }) => `
<!DOCTYPE html>
<html${makeHtmlAttributes(attributes.html)}>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${generateCss(files.css, { publicPath, attrs: attributes.link })}
</head>
<body>
  <!-- custom index.html -->
  ${generateJs(files.js, { publicPath, attrs: attributes.script })}
</body>
</html>
`.trim();

export default {
  input: 'src/app.js',
  output: {
    format: 'es',
    dir: 'dist',
    sourcemap: true,
  },
  plugins: [
    babel({ ... }),
    legacyBundle({ ... }),
    html({
      template: customIndexHTML
    })
  ]
}
```

## License

[MIT License](http://www.opensource.org/licenses/MIT)

Copyright (c) 2020-present, Sergii Stotskyi
