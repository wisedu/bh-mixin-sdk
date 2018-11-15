var getType = function(o) {
    var type = Object.prototype.toString.call(o).toLocaleLowerCase().replace('[object ', '').replace(']', '');
    if (type === 'object' && o && o.hasOwnProperty('length')) {
        return 'array';
    }
    return type;
};

function proxyJdk(lt, mobileSDK, config) {
    mobileSDK.lt = lt;
    
      //改变标题
      mobileSDK.setTitleText = function(opt = '') {
        return document.title = opt;
    };

    //扫描二维码或者一维码
    mobileSDK.scan = function(callback) {
        lt.h5.call("scan", function(ret){
            if(ret.status == 1){
                callback && callback(ret.result.text);
            }else{
                alert("识别出错，请重试！")
            }
        });
    };

    //拍照
    mobileSDK.takeCamera = function(callback, config = { allowEdit: false }) {
        lt.h5.call("takeOrPickPhoto", config, function(ret){
            // 根据返回结果计算图片大小
            function getFileSizeFromBase64 (b64) {
                b64 = b64.substring(22)
                var equalIndex= b64.indexOf('=')
                if (b64.indexOf('=') > 0) {
                    b64 = b64.substring(0, equalIndex)
                }
                var strLength = b64.length;
                return parseInt((strLength - (strLength / 8) * 2) / 1024)
            }

            var result = {
                url: ret,
                size: getFileSizeFromBase64(ret)
            }
            callback && callback(result)
        });
    };

    //预览图片
    mobileSDK.preViewImages = function() {
        var args = arguments;
        var infos = [];
        if (getType(args[0]) === 'array') {
            infos = args[0];
        }
        var showIndex = 0;
        if (getType(args[1]) === 'number') {
            showIndex = args[1];
        }
        if (infos && infos.length) {
            // let urls = infos.map(function(item) {
            //     return item.url;
            // });
            lt.h5.call("viewFullImg", infos[showIndex]);
        }
    };

    //关闭页面
    mobileSDK.closeWebView = function() {
        lt.h5.call("closeSelf");
    };

    //获取当前位置
    mobileSDK.getCurrentPosition = function(successCallback, errorCallback, config = { platform: aMap }) {
        MCK.h5.call("getCurrentPosition", config, function(ret) {
            if(ret.status == 1) {
                var result = {
                    coords: {
                        longitude: ret.result.lng, // 经度
                        latitude: ret.result.lat // 纬度
                    },
                    timestamp: +new Date()
                }
                successCallback && successCallback(result)
            }else {
                errorCallback && errorCallback(ret.error)
            }
            
        });
        
    };

    // //上传图片到emap
    mobileSDK.uploadImgsToEmap = function(opt) {
        return bh.wisedu.uploadToEMAP(opt.host, opt.urls, opt.config || {});
    };

}

export default proxyJdk;
