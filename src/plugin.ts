import {
  rollup, OutputBundle, OutputOptions, Plugin,
} from 'rollup';

type BundleResolverOptions = {
  polyfills?: string[] | undefined | null
};

function importPolyfills(polyfills: BundleResolverOptions['polyfills']): string {
  if (!polyfills) {
    return '';
  }

  return `${polyfills.map((id) => `import '${id}'`).join(';')};`;
}

function resolveFromBundle(
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

      let { code } = chunk;

      if (chunk.isEntry) {
        code = importPolyfills(options.polyfills) + code;
      }

      return {
        code,
        map: chunk.map,
      };
    },
  };
}

type LegacyPluginOptions = OutputOptions & {
  polyfills?: BundleResolverOptions['polyfills'],
  plugins?: Plugin[]
};

export default ({
  polyfills = null,
  plugins = [],
  dir = 'legacy',
  ...outputOptions
}: LegacyPluginOptions = {}): Plugin => ({
  name: 'legacy-bundle',
  async generateBundle(_, bundle) {
    const chunks = Object.values(bundle).reduce((all, chunk) => {
      if (chunk.type === 'chunk' && (chunk.isEntry || chunk.isDynamicEntry)) {
        all.push(chunk.fileName);
      }
      return all;
    }, [] as string[]);
    const legacyBundle = await rollup({
      input: chunks,
      plugins: [
        resolveFromBundle(bundle, { polyfills }),
        ...plugins,
      ],
    });
    const { output } = await legacyBundle.generate(outputOptions);

    for (const chunk of output) {
      if (chunk.type === 'asset') {
        this.emitFile({
          type: 'asset',
          fileName: `${dir}/${chunk.fileName}`,
          source: chunk.source,
        });
      } else if (chunk.type === 'chunk') {
        this.emitFile({
          type: 'asset',
          fileName: `${dir}/${chunk.fileName}`,
          source: chunk.code,
        });

        if (chunk.map) {
          this.emitFile({
            type: 'asset',
            fileName: `${dir}/${chunk.fileName}.map`,
            source: chunk.map.toString(),
          });
        }
      }
    }
  },
});
