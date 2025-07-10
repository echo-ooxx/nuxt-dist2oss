import COS from 'cos-nodejs-sdk-v5'
import { BaseUploader } from '../uploader'
import type { FileItem, UploaderConfig } from '../types'

class Tencent extends BaseUploader {
  _cos: COS

  constructor(config: UploaderConfig) {
    super(config)
    this._config = config

    const { ak, sk } = this._config.cdnConfig

    this._cos = new COS({
      SecretId: ak,
      SecretKey: sk,
    })
  }

  override async upload(file: FileItem): Promise<FileItem> {
    const { bucket, region } = this._config.cdnConfig
    return new Promise((resolve, reject) => {
      this._cos.uploadFile({
        Bucket: bucket,
        Region: region,
        Key: file.uploadKey,
        FilePath: file.realPath,
        SliceSize: 1024 * 1024 * 5,
      }, function (err, _data) {
        if (err) {
          reject(`${err}`)
        }
        else {
          resolve(file)
        }
      })
    })
  }
}

export {
  Tencent,
}
