<script setup lang="ts">
import { reactive, ref } from "vue";
import KspCropper from "@/components/ksp-cropper.vue";
import type { ResImg } from "@/types/camera";

// 当前拍照所得图片路径
const photoSrc = ref<string>();
// 所有裁剪后的图片路径集合
const photoSrcs = ref<string[]>([]);

// 拍照按钮点击处理函数
const takePhoto = async () => {
  // 微信小程序
  // #ifdef MP-WEIXIN
  const cameraContext = wx.createCameraContext();
  cameraContext.takePhoto({
    quality: "high",
    success: async (res) => {
      photoSrc.value = res.tempImagePath;
    },
    fail: (err) => {
      console.error("拍照失败：", err);
    },
  });
  // #endif

  // H5/APP端
  // #ifndef MP-WEIXIN
  const cameraContext = uni.createCameraContext();
  cameraContext.takePhoto({
    quality: "high",
    success: async (res) => {
      photoSrc.value = res.tempImagePath;
    },
    fail: (err) => {
      console.error("拍照失败：", err);
    },
  });
  // #endif
};

// 图片预览处理函数
const previewImage = (src: string) => {
  uni.previewImage({
    urls: photoSrcs.value,
    current: src,
  });
};

// 相册访问相关权限设置
function opensit() {
  uni.showModal({
    content:
      "由于您还没有允许保存图片到您相册里,这无法进行分享操作点击确定去允许授权",
    success: function (res) {
      if (res.confirm) {
        /* 这个就是打开设置的API*/
        uni.openSetting({
          success(res) {
            console.log(res.authSetting);
          },
        });
      } else if (res.cancel) {
        uni.showModal({
          cancelText: "依然取消",
          confirmText: "重新授权",
          content: "很遗憾你点击了取消，这将无法进行分享操作，请慎重考虑",
          success: function (res) {
            if (res.confirm) {
              uni.openSetting({
                success(res) {
                  console.log(res.authSetting);
                },
              });
            } else if (res.cancel) {
              console.log("用户不授权");
            }
          },
        });
      }
    },
  });
}

// 基于YOLO+Flask框架搭建的后台接口实现识别溶液滴定过程
// 将base64编码的图像转化为临时文件存储
const localImgs = reactive<string[]>([]);
const base64ToTempFilePath = (base64data: string) => {
  return new Promise((resolve, reject) => {
    const fileSystemManager = wx.getFileSystemManager();
    const timestamp = Date.now();
    const filePath = `${wx.env.USER_DATA_PATH}/pic_${timestamp}.png`;

    // 去除可能存在的 Base64 头部信息
    const cleanBase64Data = base64data.replace(/^data:image\/\w+;base64,/, "");

    fileSystemManager.writeFile({
      filePath: filePath,
      data: cleanBase64Data,
      encoding: "base64",
      success: (res) => {
        resolve(filePath);
      },
      fail: (err) => {
        console.error("写入文件失败:", err);
        reject(err);
      },
    });
  });
};

const onok = async (ev: any) => {
  // #ifdef MP-WEIXIN
  // 微信小程序端处理
  wx.uploadFile({
    url: "https://www.dev.thinkyee.com:3731/predict_image", // 替换为实际的上传 API 接口
    filePath: ev.path, // 图片的路径
    name: "image", // 对应后台接收文件的字段名
    formData: {
      // 你可以在这里添加额外的表单数据
    },
    success: (res) => {
      const resImg: ResImg = JSON.parse(res.data);
      if (resImg.label.includes("std")) {
        uni.showToast({ icon: "loading", title: "标定尚未结束，请继续~" });
      } else if (resImg.label.includes("start")) {
        uni.showToast({ icon: "success", title: "标定已达终点，请停止~" });
      } else if (resImg.label.includes("ongoing")) {
        uni.showToast({ icon: "loading", title: "滴定尚未结束，请继续~" });
      } else if (resImg.label.includes("edn")) {
        uni.showToast({ icon: "success", title: "滴定已达终点，请停止~" });
      } else {
        uni.showToast({ icon: "error", title: "请截取溶液部分~" });
      }
      // 存储临时文件路径
      base64ToTempFilePath(`${resImg.image}`)
        .then(async (filePath) => {
          localImgs.push(filePath as string);
          await wx.previewImage({
            current: filePath as string, // 当前预览的图片
            urls: localImgs, // 预览图片数组
          });
          // 将当前拍照图片路径清空，打开拍照模式
          photoSrc.value = "";
        })
        .catch((err) => {
          console.error("Base64 转换失败:", err);
        });
    },
    fail: (err) => {
      console.error("上传失败", err);
    },
  });
  // #endif
};

const oncancel = () => {
  photoSrc.value = "";
};
</script>

<template>
  <view v-if="!photoSrc" class="container">
    <view v-if="photoSrcs.length" class="gallery">
      <image
        v-for="(photoSrc, index) in photoSrcs"
        :key="index"
        :src="photoSrc"
        class="gallery-image"
        @click="previewImage(photoSrc)"
      ></image>
    </view>
    <template>
      <camera
        id="camera"
        device-position="back"
        flash="auto"
        style="width: 100%; height: 100vh"
      ></camera>
      <view class="overlay">
        <view class="test-tube"></view>
      </view>
      <button @click="takePhoto" class="capture-button">拍照</button>
    </template>
  </view>
  <template v-else>
    <ksp-cropper
      mode="fixed"
      :width="300"
      :height="400"
      :maxWidth="1024"
      :maxHeight="1024"
      :url="photoSrc"
      @cancel="oncancel"
      @ok="onok"
    ></ksp-cropper>
    <canvas canvas-id="getImageThemeColorCanvas" id="getImageThemeColorCanvas">
    </canvas>
  </template>
</template>

<style>
.container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.gallery {
  display: flex;
  gap: 10px;
  overflow-y: auto;
  padding: 10px;
  height: 120px;
  box-sizing: border-box;
  flex-wrap: wrap;
  background-color: #801c42;
  width: 100%;
}

.gallery-image {
  width: 60px;
  height: 100px;
  object-fit: cover; /* 保持图片比例，裁剪多余部分 */
  border: 2px solid #ddd;
  border-radius: 5px;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none; /* 允许点击事件穿透到相机组件 */
}

.test-tube {
  position: relative;
  width: 300px;
  height: 200px;
  border: 4px dashed #801c42; /* 用虚线表示试管边框 */
  border-radius: 150px 150px 0 0; /* 底部圆角 */
  background-color: rgba(255, 255, 255, 0.1); /* 透明背景 */
  margin-top: 50px; /* 确保瓶颈部分在试管上方 */
  overflow: hidden;
}

.capture-button {
  position: absolute;
  bottom: 50px;
  width: 100px;
  height: 50px;
  background-color: #801c42;
  color: #fff;
  text-align: center;
  line-height: 50px;
  border-radius: 25px;
  font-size: 18px;
}
</style>
