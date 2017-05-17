import axios from 'axios';

function proxyJdk(wx, mobileSDK, config) {
    console.log('wx config', config);
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
        var uploadImage = function(localId) {
            return new Promise(function(resolve, reject) {
                wx.uploadImage({
                    localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
                    isShowProgressTips: 0, // 默认为1，显示进度提示
                    success: function(res) {
                        var serverId = res.serverId; // 返回图片的服务器端ID
                        resolve(serverId);
                    }
                });
            });
        };
        var defs = opt.srcs.map(function(localId) {
            return uploadImage(localId);
        });
        return Promise.all(defs).then(function() {
            let serverIds = arguments[0];
            console.log('upload to wx success');
            let token = opt.token;
            let scope;
            if (token) {
                scope = token.substring(0, token.length - 1);
            } else {
                scope = new Date().getTime() + '' + parseInt(Math.random() * 100).toString();
                token = scope + 1;
            }

            let emapPrefixPath = config.emapPrefixPath;
            if (!/^http/.test(emapPrefixPath)) {
                emapPrefixPath = location.origin + '/' + emapPrefixPath;
            }

            let data = {
                accessToken: config.accessToken,
                serverIds: serverIds,
                emapPrefixPath: config.emapPrefixPath,
                fileToken: token,
                scope: scope
            };

            if (opt.cookie) {
                data.cookie = opt.cookie;
            }

            if (opt.origin) {
                data.origin = opt.origin;
            }

            if (opt.host) {
                data.host = opt.host;
            }
            return axios.get(config.uploadImgsToEmapUrl, { params: data });
        });
    };
    //改变标题
    mobileSDK.setTitleText = function(opt = '') {
      return document.title = opt;
    };
}

export default proxyJdk;
