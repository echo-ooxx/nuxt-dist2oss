import { BaseUploader } from '../uploader'
import type { FileItem, UploaderConfig } from '../types'
import { auth, rs, conf, form_up } from 'qiniu'

class Qiniu extends BaseUploader {
  private qiniuConf: conf.Config
  private qiniuPolicy: rs.PutPolicy
  private mac: auth.digest.Mac

  private tokeExpire = 60 * 10

  constructor(config: UploaderConfig) {
    super(config)
    this._config = config

    const { bucket, ak, sk } = this._config.cdnConfig

    this.mac = new auth.digest.Mac(ak, sk)

    this.qiniuPolicy = new rs.PutPolicy({
      scope: bucket,
      expires: this.tokeExpire,
    })

    this.qiniuConf = new conf.Config({})
  }

  override upload(file: FileItem): Promise<FileItem> {
    const uploader = new form_up.FormUploader(this.qiniuConf)
    const upToken = this.token()

    return new Promise((resolve, reject) => {
      uploader.put(
        upToken,
        file.uploadKey,
        file.realPath,
        null,
        (err, body, _info) => {
          if (err || body.error) {
            reject(err ?? body.error)
          }
          else {
            resolve(file)
          }
        },
      )
    })
  }

  token() {
    return this.qiniuPolicy.uploadToken(this.mac)
  }
}

export {
  Qiniu,
}
