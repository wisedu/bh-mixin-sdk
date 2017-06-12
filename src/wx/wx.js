import proxy from './proxy.js';

export default (callback, config = {}, dconfig = {}) => {
  let url = 'http://res.wx.qq.com/open/js/jweixin-1.2.0.js'; // 远端文件地址
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
}
