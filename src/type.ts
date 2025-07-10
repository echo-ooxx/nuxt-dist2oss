// Module options TypeScript interface definition
export interface ModuleOptions {
  cdnConfig: {
    type: 'tencent' | 'qiniu' | 'aliyun'
    ak: string
    sk: string
    bucket: string
    dir: string
    region: string
  }
  excludes?: string[]
  enable: boolean
}

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    dist2oss: Required<ModuleOptions>
  }
}
