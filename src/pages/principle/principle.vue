<script setup lang="ts">
import { ref } from 'vue'
import type { PrincipleTab } from '@/types/principle'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// tabs 数据
const principleTabs = ref<PrincipleTab[]>([
  {
    principleNo: 0,
    title: '计算原理',
    principles: [
      {
        type: 'image',
        value: '../../static/principle/principle1_1.png',
      },
      {
        type: 'text',
        value: '碘酸铜是难溶强电解质，在其饱和水溶液中，存在着下列平衡：',
      },
      {
        type: 'expression',
        value:
          'Cu(IO<sub>3</sub>)<sub>2</sub> (s) ⇌ Cu<sup>2+</sup> (aq) + 2IO<sub>3</sub><sup>-</sup> (aq)',
      },
      {
        type: 'expression',
        value:
          '在一定温度下，平衡溶液中Cu<sup>2+</sup>浓度与IO<sub>3</sub><sup>-</sup>浓度平方的乘积是一个常数：',
      },
      {
        type: 'expression',
        value: 'K<sub>sp</sub> = [Cu<sup>2+</sup>] [IO<sub>3</sub><sup>-</sup>]<sup>2</sup>',
      },
      {
        type: 'expression',
        value:
          'K<sub>sp</sub> = [Cu<sup>2+</sup>][IO<sub>3</sub><sup>-</sup>]<sup>2</sup> = 4 [Cu<sup>2+</sup>]<sup>3</sup> = 1/2[ IO<sub>3</sub><sup>-</sup>]<sup>3</sup>',
      },
    ],
  },
  {
    principleNo: 1,
    title: '比色测定原理',
    principles: [
      {
        type: 'expression',
        value: '饱和溶液中Cu<sup>2+</sup>可与过量络合物作用生成有颜色的铜配离子',
      },
      {
        type: 'expression',
        value: '<a style="color:red">氨水为显色剂</a>(选用600nm的入射光波):',
      },
      {
        type: 'image',
        value: '../../static/principle/principle2_2.png',
      },
      {
        type: 'expression',
        value:
          'Cu<sup>2+</sup> + 4NH<sub>3</sub>·H<sub>2</sub>O → [Cu(NH<sub>3</sub>)<sub>4</sub>]<sup>2+</sup> + 4H<sub>2</sub>O',
      },
      {
        type: 'expression',
        value: '<a style="color:red">甘氨酸为显色剂</a>(选用640nm的入射光波):',
      },
      {
        type: 'image',
        value: '../../static/principle/principle2_1.png',
      },
      {
        type: 'expression',
        value:
          'Cu<sup>2+</sup> + 2NH<sub>2</sub>CH<sub>2</sub>COOH → [Cu(NH<sub>2</sub>CH<sub>2</sub>COO)<sub>2</sub>]<sup>2+</sup>',
      },
      {
        type: 'expression',
        value:
          '测定一系列铜配离子标准溶液的吸光度（标准工作曲线），然后测出待测液的铜配离子的吸光度，代入标准工作曲线就能确定饱和溶液中的[Cu<sup>2+</sup>]',
      },
      {
        type: 'image',
        value: '../../static/principle/principle2_3.png',
      },
    ],
  },
  {
    principleNo: 2,
    title: '碘量法滴定原理',
    principles: [
      {
        type: 'expression',
        value:
          '碘酸铜饱和溶液中加入足量的螯合剂乙二胺四乙酸(EDTA), 使其与<a style="color: red;">铜离子</a>形成很稳定的<a style="color: red;">螯合物</a>(其稳定常数为6.8x10<sup>18</sup> ) ',
      },
      {
        type: 'expression',
        value: 'Cu<sup>2+</sup> + Y<sup>4-</sup> ══ [CuY]<sup>2-</sup>',
      },
      {
        type: 'expression',
        value:
          'IO<sub>3</sub><sup>-</sup> + 5I<sup>-</sup> + 6H<sup>+</sup> ══ 3I<sub>2</sub> + 3H<sub>2</sub>O<br/>溶液呈<a style="color: red;">棕红色</a>',
      },
      {
        type: 'expression',
        value:
          'I<sub>2</sub> + 2S<sub>2</sub>O<sub>3</sub><sup>2-</sup> ══ S<sub>4</sub>O<sub>6</sub><sup>2-</sup> + 2I<sup>-</sup><br/>溶液呈<a style="color: red;">浅蓝色</a>(近于无色)',
      },
      {
        type: 'expression',
        value:
          '1 mol IO<sub>3</sub><sup>-</sup> ⇌ 3 mol I<sub>2</sub> ⇌ 6 mol S<sub>2</sub>O<sub>3</sub><sup>2-</sup>',
      },
      {
        type: 'expression',
        value: '1 mol Cu<sup>2+</sup> ⇌ 2 mol IO<sub>3</sub><sup>-</sup>',
      },
      {
        type: 'text',
        value: '从而求出碘酸铜的溶度积常数:',
      },
      {
        type: 'expression',
        value:
          'k<sub>sp</sub> = [Cu<sup>2+</sup>][IO<sub>3</sub><sup>-</sup>]<sup>2</sup> = 1/2[IO<sub>3</sub><sup>-</sup>]<sup>2</sup> = 1/2 [C<sub>Na<sub>2</sub>S<sub>2</sub>O<sub>3</sub></sub> V<sub>Na<sub>2</sub>S<sub>2</sub>O<sub>3</sub></sub> &times; 1/6 &times; 1/V<sub>IO<sub>3</sub><sup>-</sup></sub>]<sup>3</sup>',
      },
    ],
  },
])
// 当前激活tab
const currentIndex = ref(0)
</script>

<template>
  <view class="viewport">
    <!-- tabs -->
    <view class="tabs">
      <text
        class="item"
        v-for="(item, index) in principleTabs"
        :key="item.title"
        @tap="currentIndex = index"
        :class="{ activeBar: currentIndex == index }"
      >
        {{ item.title }}
      </text>
      <!-- 游标 -->
      <view class="cursor" :style="{ left: currentIndex * 33.33 + '%' }"></view>
    </view>
    <!-- 滑动容器 -->
    <swiper class="swiper" :current="currentIndex" @change="currentIndex = $event.detail.current">
      <!-- 滑动项 -->
      <swiper-item v-for="item in principleTabs" :key="item.title">
        <!-- 实验原理列表 -->
        <scroll-view scroll-y class="principles">
          <view
            class="card"
            v-for="principle in item.principles"
            :key="principle.value"
            :class="principle.type"
          >
            <text v-if="principle.type == 'text'">{{ principle.value }} </text>
            <rich-text v-if="principle.type == 'expression'" :nodes="principle.value"> </rich-text>
            <image v-if="principle.type == 'image'" :src="principle.value" />
          </view>
          <!-- 底部提示文字 -->
          <view class="loading-text" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
            {{ true ? '没有更多数据了~' : '正在加载...' }}
          </view>
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>
</template>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
}

.viewport {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

// tabs
.tabs {
  display: flex;
  justify-content: space-around;
  line-height: 60rpx;
  margin: 0 10rpx;
  background-color: #fff;
  box-shadow: 0 4rpx 6rpx rgba(240, 240, 240, 0.6);
  position: relative;
  z-index: 9;

  .activeBar {
    background-color: #801c42;
    border-radius: 5px;
    color: #fff !important;
  }

  .item {
    flex: 1;
    text-align: center;
    padding: 20rpx;
    font-size: 28rpx;
    color: #262626;
  }

  .cursor {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 33.33%;
    height: 6rpx;
    padding: 0 50rpx;
    background-color: #801c42;
    /* 过渡效果 */
    transition: all 0.4s;
  }
}

// swiper
.swiper {
  background-color: #f7f7f8;
}

// 原理列表
.principles {
  .card {
    min-height: 100rpx;
    padding: 20rpx;
    margin: 20rpx 20rpx 0;
    border-radius: 10rpx;
    background-color: #fff;

    &:last-child {
      padding-bottom: 40rpx;
    }
  }
  .text {
    text-indent: 2em;
  }
  .expression {
    text-align: center;
  }

  .image {
    height: 200px;
    text-align: center;
  }

  .loading-text {
    text-align: center;
    font-size: 28rpx;
    color: #666;
    padding: 20rpx 0;
  }

  /* #ifdef H5 */
  uni-image {
    height: 100%;
    width: 100%;
  }
  /* #endif */
}
</style>
