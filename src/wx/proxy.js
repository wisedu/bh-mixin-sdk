function proxyJdk(wx, mobileSDK) {
    mobileSDK.wx = wx;
    //拍照
    mobileSDK.takeCamera = function(opt = {}) {
        wx.chooseImage({
            count: 1,
            sizeType: opt.sizeType || ['original', 'compressed'],
            sourceType: ['camera'],
            success: function(res) {
                opt.callback({ srcs: res.localIds });
            }
        });
    };
    //选择图片
    mobileSDK.takePhoto = function(opt = {}) {
        wx.chooseImage({
            count: opt.limit || 1,
            sizeType: opt.sizeType || ['original', 'compressed'],
            sourceType: ['album'],
            success: function(res) {
                opt.callback({ srcs: res.localIds });
            }
        });
    };
    //预览图片
    mobileSDK.previewImages = function(opt = {}) {
        if (opt.infos && opt.infos.length) {
            let urls = opt.infos.map(function(item) {
                return item.url;
            });
            wx.previewImage({
                urls: urls,
                current: urls[opt.showIndex || 0]
            });
        }
    };
    //关闭页面
    mobileSDK.closeWebView = function() {
        wx.closeWindow();
    };
    //扫描二维码或者一维码
    mobileSDK.scan = function(opt = {}) {
        wx.scanQRCode({
            needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
            scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是一维码，默认二者都有
            success: function(res) {
                opt.callback(res.resultStr);
            }
        });
    };
    //上传图片到emap
    mobileSDK.uploadImgsToEmap = function(opt) {
        return wx.uploadImgsToEmap(opt);
    };
    //改变标题
    mobileSDK.setTitleText = function(opt = '') {
      return document.title = opt;
    };
}

export default proxyJdk;
