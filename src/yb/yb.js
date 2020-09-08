import proxy from "./proxy";

export default (callback, config = {}) => {
  // 远端文件地址
  const url = "https://open.yiban.cn/wiki/js/yb_h5.js";
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  document.head.appendChild(script);
  script.onload = () => {
    const mobileSDK = {};
    proxy(mobileSDK, config);
    global.BH_MIXIN_SDK = mobileSDK;
    callback({
      type: "success",
      sdk: mobileSDK,
    });
  };
};
