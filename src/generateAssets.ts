import { OutputAsset, OutputChunk } from 'rollup';

type SimpleObject = Record<string, string | number>;
type MakeAttributes = (file: OutputAsset | OutputChunk) => string;
type Files = Array<OutputAsset | OutputChunk> | undefined;

interface AssetsOptions {
  publicPath?: string
  attrs?: SimpleObject | null
}

interface JSAssetsOptions extends AssetsOptions {
  includeSafariFix?: true
}


function htmlAttributes(attributes: AssetsOptions['attrs']): string {
  if (!attributes) {
    return '';
  }

  return Object.keys(attributes)
    .reduce((result, key) => `${result} ${key}="${attributes[key]}"`, '');
}

export function generateTags(files: Files, tagName: string, makeAttrs: MakeAttributes): string {
  if (!files) {
    return '';
  }

  return files
    .map((file) => `<${tagName} ${makeAttrs(file)}></${tagName}>`)
    .join('');
}

export function safariFixScript() {
  // eslint-disable-next-line max-len
  return '<script>!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()},!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();</script>';
}

export function generateJs(files: Files, options: JSAssetsOptions = {}): string {
  const publicPath = options.publicPath || '';
  const { type, ...defaultAttrs } = options.attrs || {} as SimpleObject;
  const scripts = generateTags(files, 'script', ({ fileName }) => {
    const typeAttr = fileName.startsWith('legacy/') ? 'nomodule defer' : 'type="module"';
    return `${typeAttr} src="${publicPath}${fileName}"${htmlAttributes(defaultAttrs)}`;
  });

  return (options.includeSafariFix ? safariFixScript() : '') + scripts;
}

export function generateCss(files: Files, { publicPath = '', attrs }: AssetsOptions = {}): string {
  return generateTags(files, 'link', ({ fileName }) => `href="${publicPath}${fileName}" rel="stylesheet"${htmlAttributes(attrs)}`);
}

type IndexHTMLOptions = {
  title?: string,
  publicPath?: string,
  files: {
    css?: OutputAsset[],
    js?: Array<OutputChunk | OutputAsset>
  },
  attributes: {
    link?: SimpleObject | null,
    script?: SimpleObject | null,
    html?: SimpleObject | null
  }
};

export const indexHTML = ({
  attributes, files, publicPath, title,
}: IndexHTMLOptions) => `
<!DOCTYPE html>
<html${htmlAttributes(attributes.html)}>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${generateCss(files.css, { publicPath, attrs: attributes.link })}
</head>
<body>
  <div id="app"></div>
  ${generateJs(files.js, { publicPath, attrs: attributes.script })}
</body>
</html>
`.trim();
