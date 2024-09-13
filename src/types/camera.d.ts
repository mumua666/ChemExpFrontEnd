/** 图像检测发送数据 */
export type ReqImg = {
  /** 返回图像Base64编码，png格式 */
  image: string
}

/** 图像检测返回结果 */
export type ResImg = {
  /** 返回图像Base64编码，png格式 */
  image: string
  label: string[]
}
