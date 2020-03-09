import { OutputAsset, OutputChunk } from 'rollup';

type SimpleObject = Record<string, string | number>;
type MakeAttributes = (file: OutputAsset | OutputChunk) => string;
type Files = Array<OutputAsset | OutputChunk>;
type AssetsOptions = {
  publicPath?: string,
  attrs?: SimpleObject | null
};

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

export function generateJs(files: Files, { publicPath = '', attrs }: AssetsOptions = {}): string {
  const { type, ...defaultAttrs } = attrs || {} as SimpleObject;
  return generateTags(files, 'script', ({ fileName }) => {
    const typeAttr = fileName.startsWith('legacy/') ? 'nomodule' : 'type="module"';
    return `${typeAttr} src="${publicPath}${fileName}"${htmlAttributes(defaultAttrs)}`;
  });
}

export function generateCss(files: Files, { publicPath = '', attrs }: AssetsOptions = {}): string {
  return generateTags(files, 'link', ({ fileName }) => `href="${publicPath}${fileName}" rel="stylesheet"${htmlAttributes(attrs)}`);
}
