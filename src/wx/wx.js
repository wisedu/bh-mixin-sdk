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
        console.log(ele);
        var mobileSDK = {};
        proxy(wx, mobileSDK, dconfig);
        global.BH_MIXIN_SDK = mobileSDK;
        callback({
          type: 'success',
          sdk: mobileSDK
        });
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
