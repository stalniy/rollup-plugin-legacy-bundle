import { rollup, OutputOptions, Plugin } from 'rollup';
import { resolveFromBundle, BundleResolverOptions } from './resolveBundlePlugin';

type LegacyPluginOptions = Omit<OutputOptions, 'plugins'> & {
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
