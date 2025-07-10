import type { Uploader, UploaderConfig, FileItem } from './types'

abstract class BaseUploader implements Uploader {
  _config: UploaderConfig

  constructor(config: UploaderConfig) {
    this._config = config
  }

  abstract upload(file: FileItem): Promise<FileItem>

  get targetDir() {
    return this._config.cdnConfig.dir
  }

  get baseDir() {
    return this._config.baseDir
  }
}

export {
  BaseUploader,
}
