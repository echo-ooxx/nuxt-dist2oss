import { Aliyun } from './strategy/aliyun'
import { Qiniu } from './strategy/qiniu'
import { Tencent } from './strategy/tencent'
import type { Uploader, UPLOAD_TYPE, UploaderConfig, FileItem } from './types'
import { statSync } from 'node:fs'

import fg from 'fast-glob'
import { fileSizeRenderFormat, useSimpleQueue } from './composables'

class UploadFactory {
  private _type: string
  private _config: UploaderConfig

  constructor(type: string, config: UploaderConfig) {
    this._type = type
    this._config = config
  }

  setStrategy(): Uploader {
    switch (this._type) {
      case 'tencent':
        return new Tencent(this._config)
      case 'aliyun':
        return new Aliyun(this._config)
      case 'qiniu':
        return new Qiniu(this._config)
      default:
        throw new Error(`unsupported type ${this._type}`)
    }
  }
}

class dist2Oss {
  private strategy: Uploader
  private _config: UploaderConfig

  constructor(type: UPLOAD_TYPE, config: UploaderConfig) {
    this._config = config
    const factory = new UploadFactory(type, this._config)
    this.strategy = factory.setStrategy()
  }

  async upload(
    publicDir: string,
    beforeUpload: (totalFiles: FileItem[]) => void,
    progress: ({ file, completeSize, total }: { file: FileItem, completeSize: number, total: number }) => Promise<void>,
    uploaded: () => Promise<void>,
  ) {
    const targetDir = this.strategy.targetDir
    const baseDir = this.strategy.baseDir
    const prefix = publicDir.substring(baseDir.length)
    let files = (await fg(`${publicDir}/**/*`)).map((path) => {
      const localDir = `${prefix}${path.replace(`${publicDir}`, '')}`
      const stat = statSync(path)
      return {
        localDir,
        uploadKey: `${targetDir}${localDir}`,
        realPath: path,
        size: fileSizeRenderFormat(stat.size, 'KB'),
      }
    })

    if (this._config.excludes) {
      const excludesFiles = await fg(this._config.excludes.map(path => `${publicDir}/${path}`))
      const _tmp = new Set(excludesFiles)
      files = files.filter(file => !_tmp.has(file.realPath))
    }
    // 上传之前的回调
    beforeUpload(files)

    // this.strategy.upload(files[0])

    const { enqueue, suspend } = useSimpleQueue()

    let done = 0
    const tasks = this.createTask(files)
    tasks.forEach((task) => {
      enqueue(task).then((file) => {
        done++
        progress({
          file,
          completeSize: done,
          total: files.length,
        })
      })
    })
    await suspend
    uploaded()
  }

  createTask(files: FileItem[]) {
    return files.map(file => () => this.strategy.upload(file))
  }
}
export {
  dist2Oss,
}
