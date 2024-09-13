import { http } from '@/utils/http'

/**
 * 图像检测
 * @param data 请求参数
 */
export const postImageDetectAPI = (data: FormData) => {
  return http({
    method: 'POST',
    url: '/predict_image',
    data,
  })
}
