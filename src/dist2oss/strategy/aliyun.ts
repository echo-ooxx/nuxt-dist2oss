import { BaseUploader } from '../uploader'
import type { FileItem, UploaderConfig } from '../types'
import OSS from 'ali-oss'

class Aliyun extends BaseUploader {
  private client: OSS

  constructor(config: UploaderConfig) {
    super(config)
    this._config = config

    const { ak, sk, bucket } = this._config.cdnConfig

    this.client = new OSS({
      accessKeyId: ak,
      accessKeySecret: sk,
      bucket,
    })
  }

  override upload(file: FileItem): Promise<FileItem> {
    return new Promise((resolve, reject) => {
      this.client.put(file.uploadKey, file.realPath)
        .then((_result) => {
          resolve(file)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
}

export {
  Aliyun,
}
