import { defineNuxtModule, useLogger } from '@nuxt/kit'
import type { ModuleOptions } from './type'
import { dist2Oss } from './dist2oss'
import { name, version } from '../package.json'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    configKey: 'dist2oss',
    compatibility: {
      nuxt: '>=3.0.0',
    },
    version,
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, _nuxt) {
    // const resolver = createResolver(import.meta.url)
    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    // addPlugin(resolver.resolve('./runtime/plugin'))
    if (_options.enable) {
      const logger = useLogger('dist2oss')
      _nuxt.hook('nitro:build:public-assets', async (nitroConfig) => {
        logger.box('dist2oss-upload')
        const dist2oss = new dist2Oss(_options.cdnConfig.type, {
          ..._options,
          baseDir: nitroConfig.options.output.dir,
        })
        await dist2oss.upload(nitroConfig.options.output.publicDir,
          (files) => {
            logger.start(`file begin upload,total:${files.length}`)
          },
          async ({
            file,
            completeSize,
            total,
          }) => {
            logger.info(`├─ ${file.localDir} ===> ${file.uploadKey} (${file.size}) [${completeSize}/${total}]`)
          },
          async () => {
            logger.success('ALL FILES HAS BEEN UPLOADED!')
          },
        )
      })
    }
  },
})
