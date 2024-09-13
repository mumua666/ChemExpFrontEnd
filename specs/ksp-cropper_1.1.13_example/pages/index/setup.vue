<template>
<view>
	<button @click="select">选择图片</button>
	<image mode="widthFix" :src="model.path"/>
	<ksp-cropper mode="fixed" :width="300" :height="400" :maxWidth="1024" :maxHeight="1024" :url="model.url" @cancel="oncancel" @ok="onok"></ksp-cropper>
</view>
</template>

<script setup>
import { reactive } from "vue";
var model = reactive({
    url: "",
    path: ""
});
function select() {
    uni.chooseImage({
        count: 1,
        success: (rst) => {
            // 设置url的值，显示控件
            model.url = rst.tempFilePaths[0];
        }
    });
}
function onok(ev) {
    model.url = "";
    model.path = ev.path;
}

function oncancel() {
    // url设置为空，隐藏控件
    model.url = "";
}
</script>
