import { Plugin, OutputBundle } from 'rollup';

export type BundleResolverOptions = {
  polyfills?: string[] | undefined | null
};

function importPolyfills(polyfills: BundleResolverOptions['polyfills']): string {
  if (!polyfills) {
    return '';
  }

  return `${polyfills.map((id) => `import '${id}'`).join(';')};`;
}

export function resolveFromBundle(
  bundle: OutputBundle,
  options: BundleResolverOptions = {},
): Plugin {
  return {
    name: 'resolve-bundle',
    resolveId(id) {
      if (bundle[id]) {
        return id;
      }
    },
    load(id) {
      const chunk = bundle[id];

      if (!chunk || chunk.type !== 'chunk') {
        return;
      }

      if (!chunk.isEntry) {
        return {
          code: chunk.code,
          map: chunk.map,
        };
      }

      return {
        // TODO: use magic-string or similar to properly handle sourcemaps
        code: `(function() {
          if (window.__isAppExecuted__) return;
          ${importPolyfills(options.polyfills) + chunk.code}
        })()`,
        map: chunk.map,
      };
    },
  };
}
