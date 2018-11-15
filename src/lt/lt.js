import proxy from './proxy.js';

export default (callback, config = {}, dconfig = {}) => {
  let url = 'http://gitee.com/lantu/mc-sdk-insight-public/raw/v2.0.1/mc-sdk.2.0.1.js'; // 文件地址
  var script = document.createElement("script");
  script.src = url;
  document.head.appendChild(script);
  script.onload = () => {
    var appkey = "24e1aeb8";
    MCK.auth(appkey);
    MCK.ready(()=>{
        // 验证通过回调, 此处可以放心调用API
        // 这里 sdk 即是 MCK
        // MCK === sdk, 为true
        var mobileSDK = {};
        proxy(MCK, mobileSDK, config);
        global.BH_MIXIN_SDK = MCK;
        callback({
            type: 'lt-success',
            sdk: mobileSDK
        });
    
      });

  };
}
