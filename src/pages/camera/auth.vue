<template>
  <view class="login-page">
    <!--    当用户点击授权同意隐私协议后才可以正常点击登录按钮获取手机号码-->
    <button
      open-type="saveImageToPhotosAlbum"
      @saveImageToPhotosAlbum="authPhotosAlbum"
      v-if="ysxy.agree"
    >
      <u-icon name="fingerprint" color="#2979ff" size="68"></u-icon>
    </button>
    <!--    当用户未授权同意意思协议时，打开授权隐私协议的弹窗，否则无法登录系统-->
    <button v-else @click="ysxy.show = true">
      <u-icon name="fingerprint" color="#2979ff" size="68"></u-icon>
    </button>
    <u-modal
      v-model="ysxy.show"
      :negative-top="200"
      title="用户隐私提示保护"
      :show-confirm-button="false"
      :mask-close-able="true"
    >
      <view class="slot-content">
        <view class="ysbox">
          感谢您使用本产品，您使用本产品前应当仔细阅读并同意<span
            @click="openYsXyDetail"
            class="ysname"
          >
            {{ ysxy.name }}
          </span>
          当您点击同意并开始使用产品服务时，即表示你已理解并同意该条款内容，该条款将对您产生法律约束力。如您拒绝，将无法更好的体验产品。
        </view>
        <div class="auth-btncard">
          <div class="btn-unok">
            <u-button :hair-line="false" :custom-style="customStyleUnOk" @click="ysxy.show = false">
              拒绝
            </u-button>
          </div>
          <div class="btn-ok">
            <u-button
              :hair-line="false"
              :custom-style="customStyleOk"
              open-type="agreePrivacyAuthorization"
              @click="
                ysxy.show = false
                ysxy.agree = true
              "
            >
              同意</u-button
            >
          </div>
        </div>
      </view>
    </u-modal>
  </view>
</template>
<script>
export default {
  data() {
    return {
      ysxy: {
        show: false,
        name: '《小程序隐私保护指引》',
        agree: false,
      },
      customStyleOk: {
        marginTop: '20rpx', // 注意驼峰命名，并且值必须用引号包括，因为这是对象
        border: 'none',
        color: '#157DFB',
      },
      customStyleUnOk: {
        marginTop: '20rpx', // 注意驼峰命名，并且值必须用引号包括，因为这是对象
        border: 'none',
        color: 'gray',
      },
    }
  },
  onLoad(option) {
    //#ifdef MP-WEIXIN
    this.initYsxy()
    //#endif
  },
  methods: {
    openYsXyDetail() {
      uni.openPrivacyContract({})
    },
    initYsxy() {
      this.ysxy.agree = false
      let _this = this
      if (uni.getPrivacySetting) {
        uni.getPrivacySetting({
          success: (res) => {
            console.log(
              '是否需要授权：',
              res.needAuthorization,
              '隐私协议的名称为：',
              res.privacyContractName,
            )
            if (res.needAuthorization) {
              _this.ysxy.name = res.privacyContractName
              _this.ysxy.show = true
            } else {
              //已经同意了
              _this.ysxy.agree = true
            }
          },
          fail: () => {},
          complete: () => {},
        })
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.ysbox {
  margin: 40rpx;

  .ysname {
    color: #157dfb;
  }
}

.auth-btncard {
  .btn-unok {
    width: 50%;
    float: left;
  }

  .btn-ok {
    width: 50%;
    float: left;
    margin: 0;
    padding: 0;
    border: 0px solid transparent; //自定义边框
    outline: none; //消除默认点击蓝色边框效果

    u-button {
      margin: 0;
      padding: 0;
      border: 0px solid transparent; //自定义边框
      outline: none; //消除默认点击蓝色边框效果
    }
  }
}
</style>
