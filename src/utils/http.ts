/**
 * 添加拦截器
 *  拦截 request 请求
 *  拦截 uploadFile 文件上传
 *
 * TODO:
 *  1. 非 http 开头需拼接地址
 *  2. 请求超时时间调整
 *  3. 添加小程序端请求头标识
 *  4. 添加 token 请求头标识
 */

const baseURL = 'http://www.dev.thinkyee.com:3729'

// 添加拦截器
const httpInterceptor = {
  // 拦截前触发
  invoke(options: UniApp.RequestOptions) {
    //  *  1. 非 http 开头需拼接地址
    if (!options.url.startsWith('http')) {
      options.url = baseURL + options.url
    }
    //  *  2. 请求超时时间调整
    options.timeout = 10 * 1000
    //  *  3. 添加小程序端请求头标识
    options.header = {
      ...options.header,
      'source-client': 'miniapp',
    }
  },
}
uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)

/**
 * 后端响应结果类型
 */
interface Data<T> {
  code: string
  msg: string
  result: T
}
/**
 * 请求函数
 * @param UniApp.RequestOptions
 * @return Promise
 * 1. 返回 Promise 对象
 * 2. 请求成功
 *  - 2.1 提取核心数据 res.data
 *  - 2.2 添加类型， 支持范型
 * 3. 请求失败
 *   - 3.1 网络错误 -> 提示用户切换网络
 *   - 3.2 401错误 -> 清理用户信息， 跳转到登陆页
 *   - 3.3 其他错误 -> 根据后端错误信息进行提示
 */
export const http = <T>(options: UniApp.RequestOptions) => {
  // 1. 返回 Promise 对象
  return new Promise<Data<T>>((resolve, reject) => {
    uni.request({
      ...options,
      // 2. 响应成功
      success(res) {
        // 状态吗 2xx
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as Data<T>)
        }
        // 3.2 401错误 -> 清理用户信息， 跳转到登陆页
        else if (res.statusCode === 401) {
          uni.navigateTo({ url: '/pages/login/login' })
          reject(res)
        } else {
          // 3.3 其他错误 -> 根据后端错误信息进行提示
          uni.showToast({
            icon: 'none',
            title: (res.data as Data<T>).msg || '请求错误',
          })
        }
      },
      // 响应失败
      fail(err) {
        uni.showToast({
          icon: 'none',
          title: '网络错误，换个网路试一试',
        })
        reject(err)
      },
    })
  })
}
