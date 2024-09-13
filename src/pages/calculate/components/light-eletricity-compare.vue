<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import qiunDataCharts from '@/components/qiun-data-charts.vue'

// 图标样式配置项
const opts = reactive({
  color: [
    '#1890FF',
    '#91CB74',
    '#FAC858',
    '#EE6666',
    '#73C0DE',
    '#3CA272',
    '#FC8452',
    '#9A60B4',
    '#ea7ccc',
  ],
  padding: [15, 15, 25, 15],
  dataLabel: false,
  enableScroll: false,
  legend: {
    show: true,
    position: 'top',
  },
  title: {
    name: '123',
  },
  xAxis: {
    disableGrid: false,
    gridType: 'dash',
    splitNumber: 5,
    boundaryGap: 'justify',
    min: 0,
    title: '铜离子浓度/(mmol/L)',
    color: '#ff0000',
    titleFontSize: 14,
    titleOffsetX: -160,
    titleOffsetY: 25,
  },
  yAxis: {
    disableGrid: false,
    gridType: 'dash',
    min: 0,
    showTitle: true,
    data: [
      {
        title: '吸光度/A',
        titleFontSize: 14,
        titleOffsetX: 0,
        titleOffsetY: -10,
      },
    ],
  },
  extra: {
    scatter: {},
  },
})
// Cu2+浓度--吸光度 测定点
const CuPoints = reactive([
  [1, 0.05],
  [2, 0.098],
  [3, 0.14],
  [4, 0.18],
  [5, 0.22],
])
// 图表数据
const chartData = {
  series: [
    {
      name: '铜离子浓度测定点',
      data: CuPoints,
    },
  ],
}

// 计算线性回归方程和相似度
const calculateRegression = (points: Array<number[]>) => {
  const n = points.length
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0
  let sumY2 = 0

  points.forEach(([x, y]) => {
    sumX += x
    sumY += y
    sumXY += x * y
    sumX2 += x * x
    sumY2 += y * y
  })

  const meanX = sumX / n
  const meanY = sumY / n

  const b = (sumXY - n * meanX * meanY) / (sumX2 - n * meanX * meanX)
  const a = meanY - b * meanX

  const sst = points.reduce((sum, [x, y]) => sum + (y - meanY) ** 2, 0)
  const sse = points.reduce((sum, [x, y]) => sum + (y - (a + b * x)) ** 2, 0)
  const r2 = 1 - sse / sst

  return { a: a.toFixed(4), b: b.toFixed(4), r2: r2.toFixed(4) }
}
// 计算属性：线性回归方程和残差计算结果
const regressionResult = computed(() => calculateRegression(CuPoints))
// 响应式地获取 a, b, r2
let { a, b, r2 } = regressionResult.value
// 使用一个函数来更新 a, b, r2，当 regressionResult 变化时
const updateValues = () => {
  const result = regressionResult.value
  a = result.a
  b = result.b
  r2 = result.r2
}
// 监听 CuPoints 的变化，当其变化时更新 a, b, r2
watch(CuPoints, updateValues, { deep: true })

// 删除特定测定点
const delPoint = (index: number) => {
  if (index >= 0 && index < CuPoints.length) {
    CuPoints.splice(index, 1)
  }
}

// 添加数据表单实例
const addDataForm = ref()
// 添加数据表单数据
const addData = reactive({
  Cu: null,
  light: null,
})
// 添加数据表单校验规则
const addDataRules = {
  Cu: {
    rules: [
      // 非空校验
      {
        required: true,
        errorMessage: 'Cu2+浓度不能为空',
      },
      // 数值校验
      {
        format: 'number',
        errorMessage: 'Cu2+浓度需为数值',
      },
    ],
  },
  light: {
    rules: [
      // 非空校验
      {
        required: true,
        errorMessage: '吸光度不能为空',
      },
      // 数值校验
      {
        format: 'number',
        errorMessage: '吸光度需为数值',
      },
    ],
  },
}
// 添加数据表单提交处理函数
const addCuPoint = () => {
  addDataForm.value
    .validate()
    .then(() => {
      CuPoints.push([Number(addData.Cu), Number(addData.light)])
      addData.Cu = null
      addData.light = null
    })
    .catch(() => {
      uni.showToast({ icon: 'error', title: '请正确填写完整信息' })
    })
}

// 测定表单实例
const detectDataForm = ref()
// 测定表单数据
const detectData = reactive({
  light: null,
  Cu: 0.0,
  CuOrigin: 0.0,
})
// 测定表单校验规则
const detectDataRules = {
  light: {
    rules: [
      // 非空校验
      {
        required: true,
        errorMessage: '吸光度不能为空',
      },
      // 数值校验
      {
        format: 'number',
        errorMessage: '吸光度需为数值',
      },
    ],
  },
}

// KSP 计算结果列表
const kspList = reactive<Array<number>[]>([])
// 添加Ksp测定点
const addKspPoint = (light: number, Ksp: number) => {
  kspList.push([light, Ksp])
}
// 删除KSP测定点
const delKspPoint = (index: number) => {
  if (index >= 0 && index < kspList.length) {
    kspList.splice(index, 1)
  }
}
// 平均Ksp计算结果
let kspAvg = -1
let diffAvg = -1
let diffRateAvg = -1

// 更新平均Ksp计算结果函数
const onKspListChange = () => {
  kspAvg = kspList.reduce((acc, cur) => acc + cur[1], 0) / kspList.length
  kspAvg = Number(kspAvg.toFixed(2))
  diffAvg = kspList.reduce((acc, cur) => acc + Math.abs(kspAvg - cur[1]), 0) / kspList.length
  diffAvg = Number(diffAvg.toFixed(2))
  diffRateAvg = (diffAvg / kspAvg) * 100
  diffRateAvg = Number(diffRateAvg.toFixed(2))
}

// 深度监视kspList列表变化，及时更新平均Ksp计算结果
watch(kspList, onKspListChange, { deep: true })

// KSP计算结果
let ksp = ref(-1)
const stdKsp = 4.81
let kspRes = '未知'
let diffRate = -1
// 监听 ksp.value 的变化，当其变化时显示KSP相关卡片内容
watch(ksp, () => {}, { deep: true })

// 根据测定的Cu2+吸光度，计算Cu2+浓度
const calKSP = () => {
  detectDataForm.value
    .validate()
    .then(() => {
      const Cu = (Number(detectData.light) - Number(a)) / Number(b)
      const CuNum = Number(Number(Cu).toFixed(4))
      detectData.Cu = CuNum
      detectData.CuOrigin = (CuNum * 5) / 3
      detectData.CuOrigin = Number(detectData.CuOrigin.toFixed(4))
      ksp.value = 4 * Math.pow(detectData.CuOrigin, 4)
      ksp.value /= 100.0
      ksp.value = Number(ksp.value.toFixed(4))

      const diff = Math.abs(ksp.value - stdKsp)
      diffRate = (diff / ksp.value) * 100
      diffRate = Number(diffRate.toFixed(2))
      addKspPoint(Number(detectData.light), ksp.value)

      if (diff < 1.1) {
        kspRes = '正常'
      } else {
        kspRes = ksp.value > stdKsp ? '偏大' : '偏小'
      }

      console.log(ksp.value)
    })
    .catch(() => {
      uni.showToast({ icon: 'error', title: '请正确填写吸光度' })
    })
}

// 思考题
const thinkQuestions = [
  '1、如果Cu(IO<sub>3</sub>)<sub>2</sub>溶液未达饱和，对测定结果有何影响？',
  '2、假如在过滤Cu(IO<sub>3</sub>)<sub>2</sub>饱和溶液时有Cu(IO<sub>3</sub>)<sub>2</sub>固体穿透滤纸，将对实验结果产生什么影响？',
  '3、饱和溶液未冷却至室温就直接过滤会有什么影响？',
]
</script>

<template>
  <!-- eslint-disable vue/no-v-text-v-html-on-component -->
  <!-- 标准溶液测定点 -->
  <view class="card">
    <uni-section title="标准溶液测定点" type="line">
      <view class="uni-container">
        <uni-table ref="table" border stripe emptyText="暂无更多数据">
          <uni-tr>
            <uni-th width="50" align="center">铜离子浓度/(mmol/L)</uni-th>
            <uni-th width="50" align="center">吸光度/A</uni-th>
            <uni-th width="20" align="center">删除</uni-th>
          </uni-tr>
          <uni-tr v-for="(points, index) in CuPoints" :key="points[1] + index">
            <uni-td align="center">{{ points[0] }}</uni-td>
            <uni-td align="center"> {{ points[1] }} </uni-td>
            <uni-td align="center">
              <button
                class="uni-button"
                style="background-color: #801c42"
                size="mini"
                type="warn"
                @tap="delPoint(index)"
              >
                删除
              </button>
            </uni-td>
          </uni-tr>
        </uni-table>
      </view>
    </uni-section>
  </view>
  <!-- 添加标准溶液测定点 -->
  <view class="card">
    <uni-section title="添加标准溶液测定点" type="line">
      <view>
        <!-- 自定义表单校验 -->
        <uni-forms ref="addDataForm" :rules="addDataRules" :modelValue="addData">
          <uni-forms-item label="铜离子" required name="Cu">
            <uni-easyinput v-model="addData.Cu" placeholder="请输入铜离子浓度/(mmol/L)" />
          </uni-forms-item>
          <uni-forms-item label="吸光度" required name="light">
            <uni-easyinput v-model="addData.light" placeholder="请输入吸光度/A" />
          </uni-forms-item>
        </uni-forms>
        <button type="primary" style="background-color: #801c42" @click="addCuPoint()">添加</button>
      </view>
    </uni-section>
  </view>
  <!-- 绘制图表 -->
  <view class="card">
    <uni-section title="标准曲线" type="line">
      <qiun-data-charts type="scatter" :opts="opts" :canvas2d="false" :chartData="chartData" />
    </uni-section>
  </view>
  <!-- 线性回归拟合结果 -->
  <view class="card">
    <uni-section title="线性回归拟合结果" type="line">
      <view class="result">
        <view class="result-title">
          <text>回归方程:</text>
        </view>
        <view class="result-expression"> y = {{ b }} x + {{ a }}</view>
        <rich-text
          class="result-expression-explanation"
          :nodes="`x: Cu<sup>2+</sup>浓度， y: 吸光度`"
        ></rich-text>
        <view class="result-title">
          <text>相关系数:</text>
        </view>
        <view class="result-expression" v-html="`R<sup>2</sup> = ${r2}`"> </view>
      </view>
    </uni-section>
  </view>
  <!-- 待测溶液测定点 -->
  <view class="card">
    <uni-section title="待测溶液测定" type="line">
      <view>
        <!-- 自定义表单校验 -->
        <uni-forms ref="detectDataForm" :rules="detectDataRules" :modelValue="detectData">
          <uni-forms-item label="吸光度" required name="light">
            <uni-easyinput v-model="detectData.light" placeholder="请输入吸光度/A" />
          </uni-forms-item>
        </uni-forms>
        <button type="primary" style="background-color: #801c42" @click="calKSP()">计算</button>
      </view>
    </uni-section>
  </view>
  <!-- 计算KSP -->
  <view class="card" v-if="ksp != -1">
    <uni-section title="计算Ksp" type="line">
      <view class="result">
        <view class="result-title">
          <text>由回归方程可知:</text>
        </view>
        <view class="result-expression"> x = (y - {{ a }}) / {{ b }}</view>
        <rich-text
          class="result-expression-explanation"
          :nodes="`x: Cu<sup>2+</sup>浓度， y: 吸光度`"
        ></rich-text>
      </view>
      <view class="result">
        <view class="result-title">
          <rich-text :nodes="`因此Cu<sup>2+</sup>浓度:`"></rich-text>
        </view>
        <view
          class="result-expression"
          v-html="`x = (${detectData.light} - ${a}) / ${b} = ${detectData.Cu} x 10<sup>-3</sup> `"
        >
        </view>
      </view>
      <view class="result">
        <view class="result-title">
          <rich-text :nodes="`由稀释比可得原溶液中Cu<sup>2+</sup>浓度:`"></rich-text>
        </view>
        <view
          class="result-expression"
          v-html="`x = 5/3 x  ${detectData.Cu} = ${detectData.CuOrigin} x 10<sup>-3</sup> `"
        >
        </view>
      </view>
      <view class="result">
        <view class="result-title">
          <text>又因为:</text>
        </view>
        <view
          class="result-expression"
          v-html="`K<sub>sp</sub></sub> = 4 c([Cu<sup>2+</sup>])<sup>3</sup>`"
        >
        </view>
      </view>
      <view class="result">
        <view class="result-title">
          <text>所以:</text>
        </view>
        <view
          class="result-expression"
          v-html="
            `K<sub>sp</sub></sub> = 4 x (${detectData.Cu} x 10<sup>-3</sup>)<sup>3</sup> = ${ksp} x 10<sup>-7</sup>`
          "
        >
        </view>
      </view>
    </uni-section>
  </view>
  <!-- 结果分析 -->
  <view class="card" v-if="ksp != -1">
    <uni-section title="Ksp计算结果分析" type="line">
      <view class="result">
        <view class="result-title">
          <text>参考Ksp:</text>
        </view>
        <view
          class="result-expression"
          v-html="`K<sub>sp</sub></sub> = ${stdKsp} x 10<sup>-7</sup>`"
        >
        </view>
      </view>
      <view class="result">
        <view class="result-title">
          <text>测定Ksp:</text>
        </view>
        <view class="result-expression" v-html="`K<sub>sp</sub></sub> = ${ksp} x 10<sup>-7</sup>`">
        </view>
      </view>
      <view class="result">
        <view class="result-title">
          <text>Ksp偏差:</text>
        </view>
        <view class="result-expression"> {{ kspRes }}</view>
      </view>
      <view class="result">
        <view class="result-title">
          <text>Ksp相对偏差:</text>
        </view>
        <view class="result-expression"> {{ diffRate }} %</view>
      </view>
    </uni-section>
  </view>
  <!-- 多次Ksp计算结果列表 -->
  <view class="card" v-if="kspList.length > 0">
    <uni-section title="Ksp计算结果列表" type="line">
      <view class="uni-container">
        <uni-table ref="table" border stripe emptyText="暂无更多数据">
          <uni-tr>
            <uni-th width="50" align="center">吸光度/A</uni-th>
            <uni-th width="50" align="center">Ksp/10^-7</uni-th>
            <uni-th width="20" align="center">删除</uni-th>
          </uni-tr>
          <uni-tr v-for="(points, index) in kspList" :key="points[1] + index">
            <uni-td align="center">{{ points[0] }}</uni-td>
            <uni-td align="center"> {{ points[1] }} </uni-td>
            <uni-td align="center">
              <button
                class="uni-button"
                style="background-color: #801c42"
                size="mini"
                type="warn"
                @tap="delKspPoint(index)"
              >
                删除
              </button>
            </uni-td>
          </uni-tr>
        </uni-table>
      </view>
    </uni-section>
  </view>
  <!-- 平均结果分析 -->
  <view class="card" v-if="kspList.length > 0">
    <uni-section title="Ksp平均计算结果分析" type="line">
      <view class="result">
        <view class="result-title">
          <text>测定平均Ksp:</text>
        </view>
        <view
          class="result-expression"
          v-html="`K<sub>sp</sub></sub> = ${kspAvg} x 10<sup>-7</sup>`"
        >
        </view>
      </view>
      <view class="result">
        <view class="result-title">
          <text>平均Ksp偏差:</text>
        </view>
        <view class="result-expression"> {{ diffAvg }}</view>
      </view>
      <view class="result">
        <view class="result-title">
          <text>平均Ksp相对偏差:</text>
        </view>
        <view class="result-expression"> {{ diffRateAvg }} %</view>
      </view>
    </uni-section>
  </view>
  <!-- 思考题 -->
  <view class="card" v-if="ksp != -1">
    <uni-section title="思考题" type="line">
      <view class="thinkQuestions" v-for="question in thinkQuestions" :key="question">
        <rich-text :nodes="question"></rich-text>
      </view>
    </uni-section>
  </view>
</template>

<style lang="scss">
.card {
  min-height: 100rpx;
  padding: 20rpx;
  margin: 20rpx 20rpx 0;
  border-radius: 10rpx;
  background-color: #fff;
  &:last-child {
    padding-bottom: 40rpx;
  }

  .result {
    font-size: 32rpx;
    margin-bottom: 5rpx;
    &-title {
      font-style: italic;
    }
    &-expression {
      font-weight: 700;
      text-align: center;
      &-explanation {
        font-weight: normal;
        color: #777;
        text-align: center;
      }
    }
  }
  .thinkQuestions {
    text-indent: 2em;
    margin-bottom: 10rpx;
    font-size: large;
  }
}

.uni-group {
  display: flex;
  align-items: center;
}
</style>
