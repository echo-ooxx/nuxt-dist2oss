import type { ModuleOptions } from '../type'

export type UploaderConfig = ModuleOptions & {
  baseDir: string
}

export type FileItem = {
  localDir: string
  uploadKey: string
  size: string
  realPath: string
}

/**
 * @param
 * _config 参数
 * @param
 * targetDir 上传目标目录
 * @param
 * baseDir 本地生成的base dir
 */
export interface Uploader {
  upload(file: FileItem): Promise<FileItem>
  _config: UploaderConfig
  targetDir: string
  baseDir: string
}

export type UPLOAD_TYPE = 'aliyun' | 'tencent' | 'qiniu'
