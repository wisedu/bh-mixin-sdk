import proxy from './proxy.js';

export default (callback, config = {}, dconfig = {}) => {
  if (window.require === undefined) {
    console.log('远端文件地址https://res.wx.qq.com')
    let url = 'https://res.wx.qq.com/open/js/jweixin-1.2.0.js'; // 远端文件地址
    var script = document.createElement("script");
    script.src = url;
    document.head.appendChild(script);
    script.onload = () => {
      wx.config(config);
      wx.ready(() => {
        var mobileSDK = {};
        proxy(wx, mobileSDK, dconfig);
        global.BH_MIXIN_SDK = mobileSDK;
        callback({
          type: 'success',
          sdk: mobileSDK
        });
      });
    };
  } else {
    if (window.wx !== undefined) {
      console.log('企业微信APP，必须通过直接引用的方式加载')
      //企业微信APP，必须通过直接引用的方式加载
      console.log(config)
      window.wx.config(config);
      window.wx.ready((ele) => {
        // wx.checkJsApi({
        //   jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
        //   success: function(res) {
        //     // 以键值对的形式返回，可用的api值true，不可用为false
        //     // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
        //     console.log('onMenuShareTimeline-onMenuShareAppMessage')
        //     console.log(res)
        //   }
        // });
        //console.log(ele);
        var mobileSDK = {};
        proxy(wx, mobileSDK, dconfig);
        global.BH_MIXIN_SDK = mobileSDK;
        callback({
          type: 'success',
          sdk: mobileSDK
        });
        // //测试临时代码
        // var imgurl = 'http://ampdx2.wisedu.com/rsfw/sys/rsydzp/public/images/zwgg_d.png';
        // var title = '我是测试啊';
        // var url = 'http://ampdx2.wisedu.com/rsfw/sys/rsydzp/share/ee9239ad09034d5a993614d276d051a0.do';
        // var desc = '我是测试啊我是测试啊';
        // wx.onMenuShareTimeline({
        //     title: title, // 分享标题
        //     desc: desc, // 分享描述
        //     link: url, // 分享链接
        //     imgUrl: imgurl, // 分享图标
        //     success: function () {
        //         alert('成功')
        //         // 用户确认分享后执行的回调函数
        //     },
        //     cancel: function () {
        //         alert('失败')
        //         // 用户取消分享后执行的回调函数
        //     }
        // });
        // wx.onMenuShareAppMessage({
        //   title: title, // 分享标题
        //   desc: desc, // 分享描述
        //   link: url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        //   imgUrl: imgurl, // 分享图标
        //   type: '', // 分享类型,music、video或link，不填默认为link
        //   dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
        //   success: function () {
        //     alert('分享朋友成功')
        //   }
        // });
      });
      window.wx.error(function(res){
        console.log('config信息验证失败会执行error函数');
        console.log(res)
        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
      });
    } else {
      console.log('微信，需要通过require的方式引用')
      //微信，需要通过require的方式引用
      window.require(['WEIXIN'], function(wx){
        console.log(wx);
        config.beta = true;
        console.log(config)
        wx.config(config);
        wx.ready(() => {
          var mobileSDK = {};
          proxy(wx, mobileSDK, dconfig);
          global.BH_MIXIN_SDK = mobileSDK;
          callback({
            type: 'success',
            sdk: mobileSDK
          });
        });
      });
    }
  }
}
