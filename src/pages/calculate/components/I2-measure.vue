<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'

//  碘酸钾 表单实例
const KVolumeRef = ref()
//  碘酸钾 表单数据
const KVolumeData = reactive({
  m: null,
  v: 100,
  c: 0.0,
})
// 碘酸钾 M
const M_KIO3 = 214
//  碘酸钾 表单校验规则
const KVolumeDataRules = {
  m: {
    rules: [
      // 非空校验
      {
        required: true,
        errorMessage: '质量不能为空',
      },
      // 数值校验
      {
        format: 'number',
        errorMessage: '质量需为数值',
      },
    ],
  },
  v: {
    rules: [
      // 非空校验
      {
        required: true,
        errorMessage: '体积不能为空',
      },
      // 数值校验
      {
        format: 'number',
        errorMessage: '体积需为数值',
      },
    ],
  },
}
//  碘酸钾 根据质量和体积计算浓度
const calK = () => {
  KVolumeRef.value
    .validate()
    .then(() => {
      KVolumeData.c = KVolumeData.m! / ((M_KIO3 * KVolumeData.v) / 100)
      KVolumeData.c = Number(KVolumeData.c.toFixed(4))
    })
    .catch(() => {
      uni.showToast({ icon: 'error', title: '请正确填写质量和体积' })
    })
}

// 硫代硫酸钠 表单实例
const NaVolumeRef = ref()
// 硫代硫酸钠 表单数据
const NaVolumeData = reactive({
  s: null,
  e: null,
  v: 0.0,
})
// 硫代硫酸钠 表单校验规则
const NaVolumeDataRules = {
  s: {
    rules: [
      // 非空校验
      {
        required: true,
        errorMessage: '起始体积不能为空',
      },
      // 数值校验
      {
        format: 'number',
        errorMessage: '起始体积需为数值',
      },
    ],
  },
  e: {
    rules: [
      // 非空校验
      {
        required: true,
        errorMessage: '终止体积不能为空',
      },
      // 数值校验
      {
        format: 'number',
        errorMessage: '终止体积需为数值',
      },
    ],
  },
}
// 硫代硫酸钠 根据体积计算浓度
const calNa = () => {
  NaVolumeRef.value
    .validate()
    .then(() => {
      NaVolumeData.v = NaVolumeData.e! - NaVolumeData.s!
      addNaPoint(NaVolumeData.s!, NaVolumeData.e!)
    })
    .catch(() => {
      uni.showToast({ icon: 'error', title: '请正确填写体积' })
    })
}

// 硫代硫酸钠 消耗体积列表
const NaList = reactive<Array<number>[]>([])
// 添加消耗体积测定点
const addNaPoint = (s: number, e: number) => {
  NaList.push([s, e, e - s])
  addNaCPoint(KVolumeData.c, e - s)
}
// 删除消耗体积测定点
const delNaPoint = (index: number) => {
  if (index >= 0 && index < NaList.length) {
    NaList.splice(index, 1)
  }
  delNaCPoint(index)
}

// 硫代硫酸钠 浓度测定
const NaVolume = 25
// 硫代硫酸钠 浓度列表
const NaCList = reactive<Array<number>[]>([])
// 添加硫代硫酸钠 浓度测定点
const addNaCPoint = (c: number, v: number) => {
  NaCList.push([v, Number(((6 * c * NaVolume) / v).toFixed(4))])
}
// 删除硫代硫酸钠 浓度测定点
const delNaCPoint = (index: number) => {
  if (index >= 0 && index < NaCList.length) {
    NaCList.splice(index, 1)
  }
}

// 硫代硫酸钠 测定浓度分析
let avgCNa = 0
let avgCNa4 = 0
let avgCNaDiff = 0
let avgCNaDiffRate = 0

// 更新平均 硫代硫酸钠 测定浓度 计算结果函数
const onNaCListChange = () => {
  avgCNa = NaCList.reduce((acc, cur) => acc + cur[1], 0) / NaCList.length
  avgCNa = Number(avgCNa.toFixed(4))
  avgCNa4 = 4 * avgCNa

  avgCNaDiff = NaCList.reduce((acc, cur) => acc + Math.abs(cur[1] - avgCNa), 0) / NaCList.length
  avgCNaDiff = Number(avgCNaDiff.toFixed(4))

  avgCNaDiffRate = (avgCNaDiff / avgCNa) * 100
  avgCNaDiffRate = Number(avgCNaDiffRate.toFixed(2))
}

// 深度监视NaList列表变化，及时更新平均Ksp计算结果
watch(NaCList, onNaCListChange, { deep: true })

// 碘酸铜中碘酸根 浓度列表
const IO3CList = reactive<Array<number>[]>([])
// 添加碘酸铜中碘酸根浓度 浓度测定点
const addIO3CPoint = (v: number, c: number) => {
  IO3CList.push([v, c])
}
// 删除碘酸铜中碘酸根浓度 浓度测定点
const delIO3CPoint = (index: number) => {
  if (index >= 0 && index < NaList.length) {
    IO3CList.splice(index, 1)
  }
}

// 碘酸铜中碘酸根 测定浓度分析
let avgCIO3 = 0
let avgCIO3Diff = 0
let avgCIO3DiffRate = 0
let KspCuIO32 = 0

// 更新平均 碘酸铜中碘酸根 测定浓度 计算结果函数
const onIO3CListChange = () => {
  avgCIO3 = IO3CList.reduce((acc, cur) => acc + cur[1], 0) / IO3CList.length
  avgCIO3 = Number(avgCIO3.toFixed(4))

  avgCIO3Diff = IO3CList.reduce((acc, cur) => acc + Math.abs(cur[1] - avgCIO3), 0) / IO3CList.length
  avgCIO3Diff = Number(avgCIO3Diff.toFixed(4))

  avgCIO3DiffRate = (avgCIO3Diff / avgCIO3) * 100
  avgCIO3DiffRate = Number(avgCIO3DiffRate.toFixed(2))

  KspCuIO32 = Math.pow(avgCIO3, 3) / 2.0
}

// 深度监视NaList列表变化
watch(IO3CList, onIO3CListChange, { deep: true })

// 碘酸铜 表单实例
const CuVolumeRef = ref()
// 碘酸铜 表单数据
const CuVolumeData = reactive({
  v: null,
  IO3: 0.0,
  ksp: 0.0,
  stdKsp: 6.3729e-7,
  diff: 0.0,
  kspRes: '未知',
  diffRate: 0.0,
})
// 碘酸铜 表单校验规则
const CuVolumeDataRules = {
  v: {
    rules: [
      // 非空校验
      {
        required: true,
        errorMessage: '体积不能为空',
      },
      // 数值校验
      {
        format: 'number',
        errorMessage: '体积需为数值',
      },
    ],
  },
}

// 碘酸铜 根据体积计算浓度
const calCu = async () => {
  await NaVolumeRef.value.validate().catch(() => {
    return uni.showToast({ icon: 'error', title: '请先计算出浓度' })
  })
  CuVolumeRef.value
    .validate()
    .then(() => {
      CuVolumeData.IO3 = (4 * KVolumeData.c * CuVolumeData.v!) / (6 * NaVolume)
      CuVolumeData.IO3 = Number(CuVolumeData.IO3.toFixed(4))
      addIO3CPoint(CuVolumeData.v!, CuVolumeData.IO3)
      CuVolumeData.ksp = Math.pow(CuVolumeData.IO3, 3) / 2.0
      CuVolumeData.diff = Math.abs(CuVolumeData.ksp - CuVolumeData.stdKsp)
      CuVolumeData.diff = Number(CuVolumeData.diff.toFixed(4))
      CuVolumeData.diffRate = Number(((CuVolumeData.diff / CuVolumeData.ksp) * 100).toFixed(2))
      if (CuVolumeData.diff * 1e7 < 1.1) {
        CuVolumeData.kspRes = '正常'
      } else {
        CuVolumeData.kspRes = CuVolumeData.ksp < CuVolumeData.stdKsp ? '偏小' : '偏大'
      }
    })
    .catch(() => {
      uni.showToast({ icon: 'error', title: '请正确填写体积' })
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
  <!-- 碘酸钾浓度 -->
  <view class="card">
    <uni-section title="测定碘酸钾浓度浓度" type="line">
      <view>
        <uni-forms ref="KVolumeRef" :rules="KVolumeDataRules" :modelValue="KVolumeData">
          <uni-forms-item label="质量" required name="m">
            <uni-easyinput v-model="KVolumeData.m" placeholder="碘酸钾使用质量/g" />
          </uni-forms-item>
          <uni-forms-item label="体积" required name="v">
            <uni-easyinput v-model="KVolumeData.v" placeholder="定容体积/(ml)" />
          </uni-forms-item>
          <uni-forms-item label="浓度" name="c" v-if="KVolumeData.c != 0">
            <uni-easyinput v-model="KVolumeData.c" placeholder="碘酸钾浓度/(mol/L)" />
          </uni-forms-item>
        </uni-forms>
        <button type="primary" style="background-color: #801c42" @click="calK()">计算</button>
      </view>
      <view v-if="KVolumeData.c != 0" class="result">
        <view class="result_tit">
          <text>因为:</text>
        </view>
        <view class="result-expression"> c*v*M = m </view>
        <view class="result_tit">
          <text>所以:</text>
        </view>
        <view class="result-expression">
          c = m/(v*M) = {{ KVolumeData.m }}/({{ KVolumeData.v }}*214) = {{ KVolumeData.c }}
        </view>
      </view>
    </uni-section>
  </view>
  <!-- 硫代硫酸钠 消耗体积计算-->
  <view class="card">
    <uni-section title="硫代硫酸钠滴定数据添加" type="line">
      <view>
        <uni-forms ref="NaVolumeRef" :rules="NaVolumeDataRules" :modelValue="NaVolumeData">
          <uni-forms-item label="起始" required name="s">
            <uni-easyinput v-model="NaVolumeData.s" placeholder="硫代硫酸钠起始体积/ml" />
          </uni-forms-item>
          <uni-forms-item label="终止" required name="e">
            <uni-easyinput v-model="NaVolumeData.e" placeholder="硫代硫酸钠终止体积/ml" />
          </uni-forms-item>
        </uni-forms>
        <button type="primary" style="background-color: #801c42" @click="calNa()">添加</button>
      </view>
    </uni-section>
  </view>
  <!-- 硫代硫酸钠 消耗体积列表 -->
  <view class="card" v-if="NaList.length > 0">
    <uni-section title="硫代硫酸钠消耗体积列表" type="line">
      <view class="uni-container">
        <uni-table ref="table" border stripe emptyText="暂无更多数据">
          <uni-tr>
            <uni-th width="50" align="center">起始体积/ml</uni-th>
            <uni-th width="50" align="center">终止体积/ml</uni-th>
            <uni-th width="50" align="center">消耗体积/ml</uni-th>
            <uni-th width="20" align="center">删除</uni-th>
          </uni-tr>
          <uni-tr v-for="(points, index) in NaList" :key="index">
            <uni-td align="center">{{ points[0] }}</uni-td>
            <uni-td align="center"> {{ points[1] }} </uni-td>
            <uni-td align="center"> {{ points[2] }} </uni-td>
            <uni-td align="center">
              <button
                class="uni-button"
                style="background-color: #801c42"
                size="mini"
                type="warn"
                @tap="delNaPoint(index)"
              >
                删除
              </button>
            </uni-td>
          </uni-tr>
        </uni-table>
      </view>
    </uni-section>
  </view>
  <!-- 硫代硫酸钠 浓度计算 -->
  <view class="card" v-if="NaList.length > 0">
    <uni-section title="硫代硫酸钠浓度计算" type="line">
      <view class="result">
        <view class="result-title">
          <text>由有关化学反应方程式:</text>
        </view>
        <view
          class="result-expression"
          v-html="`1 mol Cu<sup>2+</sup> ⇌ 2 mol IO<sub>3</sub><sup>-</sup>`"
        >
        </view>
        <view
          class="result-expression"
          v-html="`Cu<sup>2+</sup> + Y<sup>4-</sup> ══ [CuY]<sup>2-</sup>`"
        >
        </view>
        <view
          class="result-expression"
          v-html="
            `IO<sub>3</sub><sup>-</sup> + 5I<sup>-</sup> + 6H<sup>+</sup> ══ 3I<sub>2</sub> + 3H<sub>2</sub>O`
          "
        >
        </view>
        <view
          class="result-expression"
          v-html="
            `I<sub>2</sub> + 2S<sub>2</sub>O<sub>3</sub><sup>2-</sup> ══ S<sub>4</sub>O<sub>6</sub><sup>2-</sup> + 2I<sup>-</sup>`
          "
        >
        </view>
      </view>
      <view class="result">
        <view class="result-title">
          <text>可得如下关系式:</text>
        </view>
        <view
          class="result-expression"
          v-html="
            `1 mol IO<sub>3</sub><sup>-</sup> ⇌ 3 mol I<sub>2</sub> ⇌ 6 mol S<sub>2</sub>O<sub>3</sub><sup>2-</sup>`
          "
        >
        </view>
      </view>
      <view class="result">
        <view class="result-title">
          <text>又因为碘酸钾体积为:</text>
        </view>
        <view class="result-expression" v-html="`v(KIO<sub>3</sub>)=25ml`"> </view>
      </view>
      <view class="result">
        <view class="result-title">
          <text>因此可得硫代硫酸钠浓度:</text>
        </view>
        <view
          class="result-expression"
          v-html="
            `c(Na<sub>2</sub>S<sub>2</sub>O<sub>3</sub>) = (6*c(KIO<sub>3</sub>)*v(KIO<sub>3</sub>))/v(Na<sub>2</sub>S<sub>2</sub>O<sub>3</sub>)`
          "
        >
        </view>
      </view>
    </uni-section>
  </view>
  <!-- 硫代硫酸钠 浓度计算列表 -->
  <view class="card" v-if="NaCList.length > 0">
    <uni-section title="硫代硫酸钠浓度计算列表" type="line">
      <view class="uni-container">
        <uni-table ref="table" border stripe emptyText="暂无更多数据">
          <uni-tr>
            <uni-th width="50" align="center">消耗体积/ml</uni-th>
            <uni-th width="50" align="center">测定浓度/(mol/L)</uni-th>
            <uni-th width="20" align="center">删除</uni-th>
          </uni-tr>
          <uni-tr v-for="(points, index) in NaCList" :key="index">
            <uni-td align="center">{{ points[0] }}</uni-td>
            <uni-td align="center">
              6*{{ KVolumeData.c }}*{{ NaVolume }} / {{ points[0] }} = {{ points[1] }}</uni-td
            >
            <uni-td align="center">
              <button
                class="uni-button"
                style="background-color: #801c42"
                size="mini"
                type="warn"
                @tap="delNaPoint(index)"
              >
                删除
              </button>
            </uni-td>
          </uni-tr>
        </uni-table>
      </view>
    </uni-section>
  </view>
  <!-- 硫代硫酸钠 测定浓度分析 -->
  <view class="card" v-if="NaCList.length > 0">
    <uni-section title="硫代硫酸钠测定浓度分析" type="line">
      <view class="result">
        <view class="result-title">
          <text>测定硫代硫酸钠平均浓度:</text>
        </view>
        <view
          class="result-expression"
          v-html="`c(Na<sub>2</sub>S<sub>2</sub>O<sub>3</sub>) = ${avgCNa}`"
        >
        </view>
      </view>
      <view class="result">
        <view class="result-title">
          <text>平均偏差:</text>
        </view>
        <view class="result-expression"> {{ avgCNaDiff }}</view>
      </view>
      <view class="result">
        <view class="result-title">
          <text>相对平均偏差:</text>
        </view>
        <view class="result-expression"> {{ avgCNaDiffRate }} %</view>
      </view>
    </uni-section>
  </view>
  <!-- 碘酸铜 Ksp计算表单 -->
  <view class="card">
    <uni-section title="测定碘酸铜KSP" type="line">
      <view>
        <uni-forms ref="CuVolumeRef" :rules="CuVolumeDataRules" :modelValue="CuVolumeData">
          <uni-forms-item label="体积" required name="v">
            <uni-easyinput v-model="CuVolumeData.v" placeholder="碘酸铜体积/ml" />
          </uni-forms-item>
          <uni-forms-item label="碘酸根" name="IO3" v-if="CuVolumeData.IO3 != 0">
            <uni-easyinput v-model="CuVolumeData.IO3" placeholder="碘酸根离子浓度/(mol/L)" />
          </uni-forms-item>
          <uni-forms-item label="Ksp" name="ksp" v-if="CuVolumeData.IO3 != 0">
            <uni-easyinput v-model="CuVolumeData.ksp" placeholder="测定碘酸铜Ksp" />
          </uni-forms-item>
        </uni-forms>
        <button type="primary" style="background-color: #801c42" @click="calCu()">计算</button>
      </view>
    </uni-section>
  </view>
  <!-- 碘酸铜 碘酸根 浓度计算列表 -->
  <view class="card" v-if="IO3CList.length > 0">
    <uni-section title="碘酸铜碘酸根浓度计算列表" type="line">
      <view class="uni-container">
        <uni-table ref="table" border stripe emptyText="暂无更多数据">
          <uni-tr>
            <uni-th width="50" align="center">硫代硫酸钠消耗体积/ml</uni-th>
            <uni-th width="50" align="center">碘酸根离子浓度/(mol/L)</uni-th>
            <uni-th width="20" align="center">删除</uni-th>
          </uni-tr>
          <uni-tr v-for="(points, index) in IO3CList" :key="index">
            <uni-td align="center">{{ points[0] }}</uni-td>
            <uni-td align="center"> {{ points[1] }}</uni-td>
            <uni-td align="center">
              <button
                class="uni-button"
                style="background-color: #801c42"
                size="mini"
                type="warn"
                @tap="delIO3CPoint(index)"
              >
                删除
              </button>
            </uni-td>
          </uni-tr>
        </uni-table>
      </view>
    </uni-section>
  </view>
  <!-- 碘酸铜 Ksp计算过程分析 -->
  <view class="card" v-if="IO3CList.length > 0">
    <uni-section title="碘酸铜Ksp计算过程分析" type="line">
      <view class="result">
        <view class="result-title">
          <text>未稀释硫代硫酸钠浓度:</text>
        </view>
        <view
          class="result-expression"
          v-html="`c(Na<sub>2</sub>S<sub>2</sub>O<sub>3</sub>) = 4 * ${avgCNa} = ${avgCNa4}`"
        >
        </view>
      </view>
      <view class="result">
        <view class="result-title">
          <text>可知碘酸根浓度:</text>
        </view>
        <view
          class="result-expression"
          v-html="
            `c(IO<sub>3</sub><spu>-</spu>) =(c(Na<sub>2</sub>S<sub>2</sub>O<sub>3</sub>)*v(Na<sub>2</sub>S<sub>2</sub>O<sub>3</sub>))/(6*v(KIO<sub>3</sub>))`
          "
        ></view>
      </view>
      <view class="result">
        <view class="result-title">
          <text>碘酸根平均浓度:</text>
        </view>
        <view class="result-expression" v-html="`c(IO<sub>3</sub><spu>-</spu>) =${avgCIO3}`">
        </view>
      </view>
      <view class="result">
        <view class="result-title">
          <text>碘酸根浓度平均偏差:</text>
        </view>
        <view
          class="result-expression"
          v-html="`Diff c(IO<sub>3</sub><spu>-</spu>) = ${avgCIO3Diff}`"
        >
        </view>
      </view>
      <view class="result">
        <view class="result-title">
          <text>碘酸根浓度相对平均偏差:</text>
        </view>
        <view
          class="result-expression"
          v-html="`Diff Rate c(IO<sub>3</sub><spu>-</spu>) = ${avgCIO3DiffRate} %`"
        >
        </view>
      </view>
      <view class="result">
        <view class="result-title">
          <text>碘酸铜Ksp:</text>
        </view>
        <view
          class="result-expression"
          v-html="`Ksp(Cu(IO<sub>3</sub>)<sub>2</sub>) = ${KspCuIO32}`"
        >
        </view>
      </view>
    </uni-section>
  </view>
  <!-- 思考题 -->
  <view class="card" v-if="KspCuIO32 != 0">
    <uni-section title="思考题" type="line">
      <view class="thinkQuestions" v-for="(question, index) in thinkQuestions" :key="index">
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
</style>
