import axios from "axios";
import { getType, convertCoords, UUID } from "../utils";

function proxyJdk(mobileSDK, config) {
  console.log("yb config", config);
  //添加platform判断，易班api里有的方法用的是platform有的用的是versions？？坑爹
  browser.platform = browser.versions || {};
  mobileSDK.yb = browser;
  //覆盖易班错误处理api
  window.onerror = function (errorInfo) {
    console.log(errorInfo);
  };
  //拍照
  mobileSDK.takeCamera = function () {
    var args = arguments;
    var callback;
    console.log("拍照");
    // 处理参数，但是易班拍照api并不支持传递这些参数，所以没用
    if (getType(args[0]) === "boolean") {
      if (getType(args[1]) === "function") {
        callback = args[1];
      }
    }
    if (getType(args[0]) === "function") {
      callback = args[0];
    }
    var sizeType = ["original", "compressed"];
    if (getType(args[1]) === "array") {
      callback = args[1];
    }
    if (getType(args[2]) === "array") {
      sizeType = args[2];
    }
    console.log(callback);
    //处理回调
    var originCb = window.Q_camera_callback;
    window.Q_camera_callback = function (res) {
      window.Q_camera_callback = originCb;
      var result = eval("(" + res + ")");
      console.log("result.o:", result.o);
      callback &&
        callback({
          base64: result.o,
          url: result.o,
        });
    };
    //调用易班的拍照api
    photo_fun();
  };
  //选择图片
  mobileSDK.takePhoto = function () {
    var args = arguments;
    var callback;
    console.log("选择图片");
    if (getType(args[0]) === "function") {
      callback = args[0];
    }

    var limit = 1;
    if (getType(args[1]) === "number") {
      limit = args[1];
    }

    var sizeType = ["original", "compressed"];
    if (getType(args[1]) === "array") {
      sizeType = args[1];
    }
    if (getType(args[2]) === "array") {
      sizeType = args[2];
    }
    console.log("limit:" + limit);
    //处理回调
    var originCb = window.Q_camera_callback;
    window.Q_camera_callback = function (res) {
      window.Q_camera_callback = originCb;
      var result = eval("(" + res + ")");
      console.log(result.o);
      callback &&
        callback({
          base64: result.o,
          url: result.o,
        });
    };
    //易班的拍照api
    photo_fun();
  };
  //预览图片
  mobileSDK.preViewImages = function () {
    console.log("预览图片");
    var args = arguments;
    var infos = [];
    if (getType(args[0]) === "array") {
      infos = args[0];
    }
    var showIndex = 0;
    if (getType(args[1]) === "number") {
      showIndex = args[1];
    }
    if (infos && infos.length) {
      let urls = infos.map(function (item) {
        return item.url;
      });
      //易班预览图片api
      var params = {
        action: "yiban_vr_image",
        params: { vrurl: urls[showIndex] },
        callback: "",
      };
      mobile_api(JSON.stringify(params));
    }
  };
  //关闭页面
  mobileSDK.closeWebView = function () {
    console.log("关闭页面");
    back_fun();
  };
  //扫描二维码或者一维码
  mobileSDK.scan = function (callback) {
    console.log("扫码");
    //处理回调,二维码中必须包含“yiban_scan_result”标识，返回二维码字符串型内容；否则无该回调，直接以链接解析跳转
    var originCb = window.getScanResult;
    window.getScanResult = function (res) {
      window.getScanResult = originCb;
      console.log(res);
      callback && callback(res.replace("yiban_scan_result_", ""));
    };
    encode_fun();
  };
  //上传图片到emap
  mobileSDK.uploadImgsToEmap = function (opt) {
    return new Promise(function (resolve, reject) {
      console.log("上传附件");

      var serverIds = opt.urls;

      var uploadImg = function () {
        let token = opt.config && opt.config.token;
        let scope;
        if (token) {
          scope = token.substring(0, token.length - 1);
        } else {
          scope = UUID() + '' + parseInt(Math.random() * 100).toString();
            // new Date().getTime() + "" + parseInt(Math.random() * 100).toString();
          token = scope + 1;
        }

        let emapPrefixPath = config.emapPrefixPath;
        if (!/^http/.test(emapPrefixPath)) {
          emapPrefixPath = location.origin + "/" + emapPrefixPath;
        }
        let data = {
          serverIds: serverIds.join(","),
          url: serverIds.join(","),
          emapPrefixPath: config.emapPrefixPath,
          uploadImgsToEmapUrl: config.uploadImgsToEmapUrl,
          token: token,
          scope: scope,
          corp: config.corp,
          storeid: "image",
        };

        axios
          .get(opt.host + config.uploadImgsToEmapUrl, {
            params: data,
          })
          .then(
            function (res) {
              //res是请求的最外层返回，res.data才到数据层。
              //之前的判断是拿不到res.success这个对象的，所以会有部分（也没搞明白为什么只有部分应用暴露了这个问题）报错没有取到token
              if (
                res.code === "0" ||
                res.success ||
                res.data.code === "0" ||
                res.data.success
              ) {
                res.data.token = token;
              } else {
                res.data.msg = "上传失败，未获取到token";
              }
              resolve(res.data);
            },
            function (res) {
              reject(res.data);
            }
          )
          .catch(function (res) {
            reject(res.data);
          });
      };
      uploadImg();
    });
  };
  //改变标题
  mobileSDK.setTitleText = function (opt = "") {};
  //获取当前位置
  mobileSDK.getCurrentPosition = function (
    successCallback,
    errorCallback,
    options
  ) {
    console.log("获取当前位置");
    options = options || {};

    //处理回调,postion  Json  {"longitude":"经度坐标", "latitude":"纬度坐标", "address":"位置名称"}
    var originCb = window.yibanhtml5location;
    window.yibanhtml5location = function (res) {
      window.yibanhtml5location = originCb;
      console.log("yibanhtml5location:", res);
      var coordsObj = {
        longitude: "",
        latitude: "",
        address: "",
      };
      if (res) {
        coordsObj = JSON.parse(res);
      }
      successCallback &&
        successCallback({
          timestamp: +new Date(),
          // 1：获取高德坐标；0：获取标准坐标，默认高德坐标
          coords:
            options.coordinate === 0 ? coordsObj : convertCoords(coordsObj),
        });
    };
    var originErrorCb = window.onerror;
    window.onerror = function (res) {
      window.onerror = originErrorCb;
      console.log("onerror:", res);
      errorCallback && errorCallback(res);
    };
    gethtml5location_fun();
  };
  //获取设备Id
  mobileSDK.getDeviceId = function (callback) {
    console.log("获取设备Id");

    if (typeof callback === "function") {
      var params = { action: "uuid", params: {}, callback: "onlyid_back" };
      //处理回调
      var originCb = window.onlyid_back;
      window.onlyid_back = function (res) {
        window.onlyid_back = originCb;
        console.log("onlyid_back:", res);
        callback({
          type: "success",
          data: {
            uuid: res, //.uuid
          },
        });
      };
      mobile_api(JSON.stringify(params));
    }
  };
}

export default proxyJdk;
