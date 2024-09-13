<script setup lang="ts">
import { reactive, ref } from 'vue'
import lightEletricityCompare from './components/light-eletricity-compare.vue'
import I2Measure from './components/I2-measure.vue'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

//  不同计算方法Tab页配置项
const calculateTabs = reactive([
  {
    id: 0,
    title: '光电比色法',
  },
  {
    id: 1,
    title: '碘量法',
  },
])
// 当前激活Tab
const currentIndex = ref(0)
</script>

<template>
  <view class="viewport">
    <!-- tabs -->
    <view class="tabs">
      <text
        class="item"
        v-for="(item, index) in calculateTabs"
        :key="item.title"
        @tap="currentIndex = index"
        :class="{ activeBar: currentIndex == index }"
      >
        {{ item.title }}
      </text>
      <!-- 游标 -->
      <view class="cursor" :style="{ left: currentIndex * 50 + '%' }"></view>
    </view>
    <!-- swiper -->
    <swiper class="swiper" :current="currentIndex" @change="currentIndex = $event.detail.current">
      <!-- 滑动项 -->
      <swiper-item v-for="(item, index) in calculateTabs" :key="item.title">
        <!-- 计算过程列表 -->
        <scroll-view scroll-y class="calculates">
          <lightEletricityCompare v-if="index === 0" />
          <I2Measure v-if="index === 1" />
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
    width: 50%;
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

// swiper 内容项
.calculates {
  .loading-text {
    text-align: center;
    font-size: 28rpx;
    color: #666;
    padding: 20rpx 0;
  }
}
</style>
