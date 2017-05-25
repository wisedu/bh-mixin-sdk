var getType = function(o) {
    var type = Object.prototype.toString.call(o).toLocaleLowerCase().replace('[object ', '').replace(']', '');
    if (type === 'object' && o && o.hasOwnProperty('length')) {
        return 'array';
    }
    return type;
};

function proxyJdk(bh, mobileSDK) {
    mobileSDK.bh = bh;
    //拍照
    mobileSDK.takeCamera = function() {
        var args = arguments;
        var callback;
        var isfront = false;
        if (getType(args[0]) === 'boolean') {
            isfront = args[0];
            if (getType(args[1]) === 'function') {
                callback = args[1];
            }
        }
        if (getType(args[0]) === 'function') {
            callback = args[0];
        }
        return bh.systemAbility.takeCamera(function(ret) {
            callback && callback(ret);
        });
    };
    //选择图片
    mobileSDK.takePhoto = function() {
        var args = arguments;
        var callback;
        if (getType(args[0]) === 'function') {
            callback = args[0];
        }
        var limit = 1;
        if (getType(args[1]) === 'number') {
            limit = args[1];
        }
        return bh.systemAbility.takePhoto(function(ret) {
            callback && callback(ret);
        }, limit);
    };
    //预览图片
    mobileSDK.preViewImages = function() {
        return bh.UI.preViewImages.apply(bh.UI, arguments);
    };
    //关闭页面
    mobileSDK.closeWebView = function() {
        return bh.UI.closeWebView();
    };
    //扫描二维码或者一维码
    mobileSDK.scan = function() {
        return bh.qrcode.scan.apply(bh.qrcode, arguments);
    };
    //上传图片到emap
    mobileSDK.uploadImgsToEmap = function(opt) {
        return bh.wisedu.uploadToEMAP(opt.host, opt.urls, opt.config || {});
    };
    //改变标题
    mobileSDK.setTitleText = function(opt = '') {
        return bh.UI.setTitleText(opt);
    };
    //获取网络地址
    mobileSDK.getCurrentPosition = function() {
        bh.geolocation.getCurrentPosition.apply(bh.geolocation, arguments);
    };
}

export default proxyJdk;
