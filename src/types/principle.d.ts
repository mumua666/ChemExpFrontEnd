/** 原理展示栏类型 */
export type PrincipleTab = {
  /** 原理序号标识 */
  principleNo: number
  /** 原理名称 */
  title: string
  /** 原理内容 */
  principles: {
    /** 单项原理表述类型 */
    type: string
    /** 单项原理表述具体内容 */
    value: string
  }[]
}
