function proxyJdk(bh, mobileSDK) {
    mobileSDK.bh = bh;
    //拍照
    mobileSDK.takeCamera = function(opt = {}) {
        return bh.systemAbility.takeCamera(opt.isfront || false, function(ret) {
            var srcs = ['data:image/jpeg;base64,' + ret.base64];
            opt.callback({
                srcs: srcs
            });
        });
    };
    //选择图片
    mobileSDK.takePhoto = function(opt = {}) {
        return bh.systemAbility.takePhoto(function(ret) {
            var srcs = ['data:image/jpeg;base64,' + ret.base64];
            if (ret.length) {
                srcs = ret.map(function(item) {
                    return 'data:image/jpeg;base64,' + item.base64;
                });
            }
            opt.callback({
                srcs: srcs
            });
        }, opt.limit || 1);
    };
    //预览图片
    mobileSDK.previewImages = function(opt) {
        return bh.UI.preViewImages(opt.infos, opt.showIndex || 0);
    };
    //关闭页面
    mobileSDK.closeWebView = function() {
        return bh.UI.closeWebView();
    };
    //扫描二维码或者一维码
    mobileSDK.scan = function(opt = {}) {
        return bh.qrcode.scan(opt.callback, opt.keeping || false);
    };
    //上传图片到emap
    mobileSDK.uploadImgsToEmap = function(opt) {
        return bh.wisedu.uploadToEMAP(opt.host, opt.files, opt.config || {});
    };
    //改变标题
    mobileSDK.setTitleText = function(opt = '') {
      return BH_MOBILE_SDK.UI.setTitleText(opt);
    };

}

export default proxyJdk;
