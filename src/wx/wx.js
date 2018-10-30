import proxy from './proxy.js';

export default (callback, config = {}, dconfig = {}) => {
  if (window.require === undefined) {
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
      //企业微信APP，必须通过直接引用的方式加载
      window.wx.config(config);
      window.wx.ready(() => {
        var mobileSDK = {};
        proxy(wx, mobileSDK, dconfig);
        global.BH_MIXIN_SDK = mobileSDK;
        callback({
          type: 'success',
          sdk: mobileSDK
        });
      });
    } else {
      //微信，需要通过require的方式引用
      window.require(['WEIXIN'], function(wx){
        console.log(wx);
        config.beta = true;
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
