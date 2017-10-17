import proxy from './proxy.js';

export default (callback, config = {}, dconfig = {}) => {
  let url = 'https://g.alicdn.com/dingding/open-develop/1.6.9/dingtalk.js'; // 远端文件地址
  var script = document.createElement("script");
  script.src = url;
  document.head.appendChild(script);
  //console.log('append------------------')
  script.onload = function() {
    //console.log('function config-------------');
    //console.log(config);
    dd.config(config);
    dd.ready(function() {
      //console.log('ready-start---------')
      var mobileSDK = {};
      proxy(dd, mobileSDK, dconfig);
      global.BH_MIXIN_SDK = mobileSDK;
      callback({
        type: 'success',
        sdk: mobileSDK
      });
    });
    dd.error(function(error) {
      /**
       {
          message:"错误信息",//message信息会展示出钉钉服务端生成签名使用的参数，请和您生成签名的参数作对比，找出错误的参数
          errorCode:"错误码"
       }
      **/
      alert('dd error: ' + JSON.stringify(error));
    });
  };
}
